import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { AppAuthService } from './app.auth.service';
import { AppRoles } from '../app.roles';
import { CurrentUser } from '../data/user';
import { environment } from '../../environments/environment';
import { OAuthServiceStub, fakeAccessToken } from './oauth.stub';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

/**
 * Test der Rollenauswertung.
 *
 * Sie ist der Dreh- und Angelpunkt der Absicherung: derselbe Code steuert
 * den Router-Guard (`appCanActivate`) und die Direktive `*appIsInRoles`.
 * Geprüft wird, dass die Realm-Rollen korrekt aus dem Access-Token gelesen
 * werden - genau dort legt Keycloak sie unter `realm_access.roles` ab.
 */
describe('AppAuthService', () => {
  let service: AppAuthService;
  let oauth: OAuthServiceStub;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppAuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
      teardown: { destroyAfterEach: true },
    });

    service = TestBed.inject(AppAuthService);
    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Meldet einen Benutzer mit den angegebenen Realm-Rollen an. */
  function signIn(username: string, roles: string[]): void {
    oauth.signIn(fakeAccessToken(username, roles));
    service.syncFromToken();
  }

  it('übernimmt Benutzername und Rollen aus dem Access-Token', () => {
    signIn('testuser', [AppRoles.User]);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.displayName()).toBe('testuser');
    expect(service.roles()).toEqual(['USER']);
    expect(service.initials()).toBe('TE');
  });

  it('erkennt die Rolle ADMIN', () => {
    signIn('testadmin', [AppRoles.Admin, AppRoles.User]);

    expect(service.isAdmin()).toBe(true);
    expect(service.isUser()).toBe(true);
    expect(service.hasRole(AppRoles.Admin)).toBe(true);
    expect(service.isInRoles([AppRoles.Admin])).toBe(true);
  });

  it('erkennt fehlende Berechtigungen der Rolle USER', () => {
    signIn('testuser', [AppRoles.User]);

    expect(service.isAdmin()).toBe(false);
    expect(service.hasRole(AppRoles.Admin)).toBe(false);
    expect(service.isInRoles([AppRoles.Admin])).toBe(false);
  });

  it('lässt eine leere Rollenliste als «keine Einschränkung» durchgehen', () => {
    signIn('testuser', []);

    expect(service.isInRoles([])).toBe(true);
  });

  it('setzt den Benutzer zurück, wenn keine Anmeldung besteht', () => {
    signIn('testuser', [AppRoles.User]);
    oauth.signOut();
    service.syncFromToken();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.displayName()).toBe('Gast');
  });

  it('lädt das Profil über GET /api/users/me nach', () => {
    signIn('testuser', [AppRoles.User]);

    const profile: CurrentUser = {
      username: 'testadmin',
      email: 'testadmin@example.ch',
      subject: 'abc-123',
      roles: [AppRoles.Admin],
    };

    service.loadProfile().subscribe();

    const request = httpMock.expectOne(`${environment.backendBaseUrl}users/me`);
    expect(request.request.method).toBe('GET');
    request.flush(profile);

    // Das Backend hat das letzte Wort: Seine Antwort ersetzt die Angaben
    // aus dem Token.
    expect(service.user()?.email).toBe('testadmin@example.ch');
    expect(service.isAdmin()).toBe(true);
  });

  it('fragt das Profil gar nicht erst ab, solange niemand angemeldet ist', () => {
    let result: CurrentUser | null | undefined;
    service.loadProfile().subscribe((value) => (result = value));

    // httpMock.verify() im afterEach belegt, dass kein Request rausging.
    expect(result).toBeNull();
  });

  it('merkt sich beim Login die gewünschte Zieladresse als OAuth-state', () => {
    service.login('/bugs/7');

    expect(oauth.state).toBe('/bugs/7');
    expect(service.redirectTarget()).toBe('/bugs/7');
  });

  it('meldet ab und vergisst dabei den Benutzer', () => {
    signIn('testuser', [AppRoles.User]);
    service.logout();

    expect(oauth.loggedOut).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });
});
