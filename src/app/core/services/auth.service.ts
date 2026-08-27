import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { Observable, catchError, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AppRole, CurrentUser } from '../models/user.model';

/**
 * Zentrale Anlaufstelle für alles rund um Authentifizierung und Rollen.
 *
 * Kapselt den `KeycloakService` (OAuth 2 / OpenID Connect) und stellt den
 * angemeldeten Benutzer als Signal bereit, damit Komponenten und Templates
 * ohne Subscription-Handling auf den Zustand reagieren können.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(KeycloakService);
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<CurrentUser | null>(null);
  private readonly loggedIn = signal<boolean>(false);

  /** Der angemeldete Benutzer inklusive Realm-Rollen (oder `null`). */
  readonly user = this.currentUser.asReadonly();

  /** `true`, sobald ein gültiges Keycloak-Token vorliegt. */
  readonly isAuthenticated = this.loggedIn.asReadonly();

  /** Anzeigename für die Toolbar. */
  readonly displayName = computed(() => this.currentUser()?.username ?? 'Gast');

  /** Alle Realm-Rollen des angemeldeten Benutzers. */
  readonly roles = computed<string[]>(() => this.currentUser()?.roles ?? []);

  /** `true`, wenn der Benutzer die Realm-Rolle ADMIN besitzt. */
  readonly isAdmin = computed(() => this.roles().includes(AppRole.ADMIN));

  /** `true`, wenn der Benutzer die Realm-Rolle USER besitzt. */
  readonly isUser = computed(() => this.roles().includes(AppRole.USER));

  /** Initialen für den Avatar in der Toolbar. */
  readonly initials = computed(() => {
    const name = this.currentUser()?.username ?? '';
    return name ? name.slice(0, 2).toUpperCase() : '?';
  });

  /**
   * Übernimmt den Zustand aus Keycloak in die Signale.
   * Wird beim Start der Anwendung (APP_INITIALIZER) und nach jedem
   * Keycloak-Event aufgerufen.
   */
  syncFromKeycloak(): void {
    const authenticated = this.keycloak.isLoggedIn();
    this.loggedIn.set(authenticated);

    if (!authenticated) {
      this.currentUser.set(null);
      return;
    }

    // Solange /api/users/me noch nicht geantwortet hat, werden die Angaben
    // direkt aus dem Token gelesen. So ist die Oberfläche nie "rollenlos".
    this.currentUser.set({
      username: this.keycloak.getUsername(),
      email: '',
      subject: '',
      roles: this.keycloak.getUserRoles(true),
    });
  }

  /**
   * Lädt das Benutzerprofil vom Backend (`GET /api/users/me`).
   * Damit ist belegt, dass das Token tatsächlich vom Backend akzeptiert wird.
   */
  loadProfile(): Observable<CurrentUser | null> {
    if (!this.keycloak.isLoggedIn()) {
      return of(null);
    }
    return this.http.get<CurrentUser>(`${environment.apiUrl}/users/me`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => of(this.currentUser())),
    );
  }

  /** Leitet auf die Login-Maske von Keycloak weiter. */
  login(redirectUri: string = window.location.origin): Promise<void> {
    return this.keycloak.login({ redirectUri });
  }

  /** Meldet den Benutzer ab und kehrt zur Startseite zurück. */
  logout(redirectUri: string = window.location.origin): Promise<void> {
    this.currentUser.set(null);
    this.loggedIn.set(false);
    return this.keycloak.logout(redirectUri);
  }

  /** Oeffnet die Registrierungsmaske von Keycloak. */
  register(): Promise<void> {
    return this.keycloak.register({ redirectUri: window.location.origin });
  }

  /** Prüft eine einzelne Realm-Rolle. */
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /** Prüft, ob mindestens eine der übergebenen Rollen vorhanden ist. */
  hasAnyRole(roles: string[]): boolean {
    if (roles.length === 0) {
      return true;
    }
    return roles.some((role) => this.hasRole(role));
  }

  /** Liefert ein gültiges Access-Token (erneuert es bei Bedarf). */
  async getToken(): Promise<string> {
    await this.keycloak.updateToken(30).catch(() => false);
    return this.keycloak.getToken();
  }
}
