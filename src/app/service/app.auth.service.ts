import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, catchError, of, tap } from 'rxjs';

import { authConfig } from '../app.auth';
import { AppRoles } from '../app.roles';
import { CurrentUser } from '../data/user';
import { environment } from '../../environments/environment';

/** Nach dieser Zeit gilt Keycloak als nicht erreichbar. */
const KEYCLOAK_TIMEOUT_MS = 8000;

/**
 * Aufbau des Keycloak-Access-Tokens, soweit hier gebraucht.
 * Realm-Rollen stehen bei Keycloak unter `realm_access.roles`.
 */
interface KeycloakAccessToken {
  preferred_username?: string;
  email?: string;
  sub?: string;
  realm_access?: { roles?: string[] };
}

/**
 * Zentrale Anlaufstelle für Authentifizierung und Rollen.
 *
 * Entspricht `service/app.auth.service.ts` aus dem Demoprojekt des ÜK und
 * kapselt den `OAuthService` der Bibliothek `angular-oauth2-oidc`. Nach
 * aussen gibt es nur Signale - Komponenten und Templates reagieren dadurch
 * ohne eigenes Subscription-Handling auf An- und Abmeldung.
 *
 * Warum `angular-oauth2-oidc` und nicht `keycloak-js`?
 * Die Wegleitung zur Projektarbeit empfiehlt genau diese Bibliothek. Sie
 * spricht reines OpenID Connect, hängt also nicht an einem bestimmten
 * Anbieter, und bringt mit `provideOAuthClient({ resourceServer: ... })`
 * bereits einen Interceptor für den Bearer-Token mit. Ein eigener
 * `authInterceptor` wird dadurch überflüssig.
 */
@Injectable({ providedIn: 'root' })
export class AppAuthService {
  private readonly oauth = inject(OAuthService);
  private readonly http = inject(HttpClient);

  /**
   * Liest die Claims aus dem Access-Token.
   *
   * Bewusst der Access-Token und nicht der ID-Token: Keycloak legt die
   * Realm-Rollen nur in den Access-Token (`realm_access.roles`), und genau
   * diese Rollen wertet auch das Backend aus.
   */
  private readonly jwt = new JwtHelperService();

  private readonly currentUser = signal<CurrentUser | null>(null);
  private readonly loggedIn = signal<boolean>(false);

  /** Der angemeldete Benutzer inklusive Realm-Rollen (oder `null`). */
  readonly user = this.currentUser.asReadonly();

  /** `true`, sobald ein gültiger Access-Token vorliegt. */
  readonly isAuthenticated = this.loggedIn.asReadonly();

  /** Anzeigename für die Kopfzeile. */
  readonly displayName = computed(() => this.currentUser()?.username ?? 'Gast');

  /** Alle Realm-Rollen des angemeldeten Benutzers. */
  readonly roles = computed<string[]>(() => this.currentUser()?.roles ?? []);

  /** `true`, wenn der Benutzer die Realm-Rolle ADMIN besitzt. */
  readonly isAdmin = computed(() => this.roles().includes(AppRoles.Admin));

  /** `true`, wenn der Benutzer die Realm-Rolle USER besitzt. */
  readonly isUser = computed(() => this.roles().includes(AppRoles.User));

  /** Initialen für den Avatar in der Kopfzeile. */
  readonly initials = computed(() => {
    const name = this.currentUser()?.username ?? '';
    return name ? name.slice(0, 2).toUpperCase() : '?';
  });

  /**
   * Startet OAuth 2, bevor die Anwendung gerendert wird.
   *
   * Wird in `app.config.ts` über einen Initializer aufgerufen - im
   * Demoprojekt heisst das Gegenstück `provideEnvironmentInitializer(...)`.
   *
   * `loadDiscoveryDocumentAndTryLogin()` holt die Metadaten des Realms und
   * schliesst - falls Keycloak gerade zurückgeleitet hat - den Login ab.
   * Bestand bereits eine Sitzung, ist der Benutzer sofort angemeldet.
   *
   * Antwortet Keycloak nicht innerhalb von `KEYCLOAK_TIMEOUT_MS`, startet
   * die Anwendung trotzdem - dann allerdings abgemeldet. So bleibt die
   * Startseite bedienbar und der Benutzer sieht einen Hinweis statt eines
   * endlos leeren Bildschirms.
   */
  async initAuth(): Promise<void> {
    this.oauth.configure(authConfig);

    try {
      await Promise.race([
        this.oauth.loadDiscoveryDocumentAndTryLogin(),
        rejectAfter(KEYCLOAK_TIMEOUT_MS),
      ]);

      // Erneuert den Access-Token automatisch über den Refresh-Token,
      // bevor er abläuft. Ohne das müsste sich der Benutzer nach der
      // Token-Laufzeit (bei Keycloak standardmässig 5 Minuten) neu anmelden.
      this.oauth.setupAutomaticSilentRefresh();
    } catch {
      console.warn(
        '[Keycloak] Start fehlgeschlagen. Läuft der Server auf ' +
          `${environment.keycloak.url} mit dem Realm "${environment.keycloak.realm}"?`,
      );
    }

    this.syncFromToken();

    if (this.loggedIn()) {
      // Profil vom Backend nachladen - belegt, dass das Token akzeptiert wird.
      this.loadProfile().subscribe();
    }
  }

  /**
   * Übernimmt Benutzername und Rollen aus dem Access-Token in die Signale.
   * Wird beim Start und nach jedem Wechsel des Anmeldezustands aufgerufen.
   */
  syncFromToken(): void {
    const authenticated = this.oauth.hasValidAccessToken();
    this.loggedIn.set(authenticated);

    if (!authenticated) {
      this.currentUser.set(null);
      return;
    }

    const token = this.oauth.getAccessToken();
    const claims = this.decode(token);

    this.currentUser.set({
      username: claims?.preferred_username ?? '',
      email: claims?.email ?? '',
      subject: claims?.sub ?? '',
      roles: claims?.realm_access?.roles ?? [],
    });
  }

  /**
   * Lädt das Benutzerprofil vom Backend (`GET /api/users/me`).
   * Damit ist belegt, dass das Token tatsächlich vom Backend akzeptiert
   * wird - und nicht nur der Browser es für gültig hält.
   */
  loadProfile(): Observable<CurrentUser | null> {
    if (!this.oauth.hasValidAccessToken()) {
      return of(null);
    }
    return this.http.get<CurrentUser>(`${environment.backendBaseUrl}users/me`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => of(this.currentUser())),
    );
  }

  /**
   * Leitet auf die Login-Maske von Keycloak weiter.
   *
   * `targetUrl` wird als OAuth-`state` mitgegeben und steht nach der
   * Rückkehr in `oauth.state`. So landet der Benutzer wieder auf der Seite,
   * die er ursprünglich aufrufen wollte, obwohl Keycloak immer auf die
   * feste `redirectUri` aus `app.auth.ts` zurückleitet.
   */
  login(targetUrl?: string): void {
    // Kein eigenes encodeURIComponent noetig: Die Bibliothek kodiert den
    // Zusatz-State beim Aufbau der Login-URL und dekodiert ihn beim
    // Zurueckkommen wieder - der Wert kommt also unveraendert an.
    this.oauth.initLoginFlow(targetUrl);
  }

  /** Die vor dem Login gemerkte Zieladresse (oder `null`). */
  redirectTarget(): string | null {
    return this.oauth.state || null;
  }

  /** Meldet den Benutzer bei Keycloak ab und kehrt zur Startseite zurück. */
  logout(): void {
    this.currentUser.set(null);
    this.loggedIn.set(false);
    this.oauth.logOut();
  }

  /** Prüft eine einzelne Realm-Rolle. */
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /**
   * Prüft, ob mindestens eine der übergebenen Rollen vorhanden ist.
   *
   * Name und Verhalten wie im Demoprojekt: Die Direktive `*appIsInRoles`
   * und der Guard `appCanActivate` rufen ausschliesslich diese Methode auf.
   * Eine leere Liste bedeutet «keine Einschränkung».
   */
  isInRoles(roles: string[]): boolean {
    if (roles.length === 0) {
      return true;
    }
    return roles.some((role) => this.hasRole(role));
  }

  /** Der aktuelle Access-Token (leer, wenn nicht angemeldet). */
  getToken(): string {
    return this.oauth.getAccessToken();
  }

  /** Dekodiert den Token; liefert `null`, wenn er fehlt oder unlesbar ist. */
  private decode(token: string): KeycloakAccessToken | null {
    if (!token) {
      return null;
    }
    try {
      return this.jwt.decodeToken<KeycloakAccessToken>(token);
    } catch {
      return null;
    }
  }
}

/** Hilfsfunktion für das Zeitlimit beim Start von Keycloak. */
function rejectAfter(milliseconds: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error('Zeitlimit überschritten')), milliseconds);
  });
}
