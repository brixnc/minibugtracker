import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { KeycloakService } from 'keycloak-angular';

import { AuthService } from './auth.service';
import { AppRole, CurrentUser } from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * Test der Rollenauswertung. Sie steuert sowohl die Router-Guards als auch
 * die rollenabhängige Anzeige in den Templates.
 */
describe('AuthService', () => {
  class KeycloakServiceStub {
    loggedIn = true;
    roles: string[] = ['USER'];
    isLoggedIn = () => this.loggedIn;
    getUsername = () => 'testuser';
    getUserRoles = () => this.roles;
    updateToken = () => Promise.resolve(true);
    getToken = () => Promise.resolve('test-token');
  }

  let service: AuthService;
  let keycloak: KeycloakServiceStub;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KeycloakService, useClass: KeycloakServiceStub },
      ],
    });

    service = TestBed.inject(AuthService);
    keycloak = TestBed.inject(KeycloakService) as unknown as KeycloakServiceStub;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('übernimmt Benutzername und Rollen aus dem Token', () => {
    keycloak.roles = ['USER'];
    service.syncFromKeycloak();

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.displayName()).toBe('testuser');
    expect(service.roles()).toEqual(['USER']);
    expect(service.initials()).toBe('TE');
  });

  it('erkennt die Rolle ADMIN', () => {
    keycloak.roles = [AppRole.ADMIN, AppRole.USER];
    service.syncFromKeycloak();

    expect(service.isAdmin()).toBeTrue();
    expect(service.isUser()).toBeTrue();
    expect(service.hasRole(AppRole.ADMIN)).toBeTrue();
    expect(service.hasAnyRole([AppRole.ADMIN])).toBeTrue();
  });

  it('erkennt fehlende Berechtigungen der Rolle USER', () => {
    keycloak.roles = [AppRole.USER];
    service.syncFromKeycloak();

    expect(service.isAdmin()).toBeFalse();
    expect(service.hasRole(AppRole.ADMIN)).toBeFalse();
    expect(service.hasAnyRole([AppRole.ADMIN])).toBeFalse();
  });

  it('setzt den Benutzer zurück, wenn keine Anmeldung besteht', () => {
    keycloak.loggedIn = false;
    service.syncFromKeycloak();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.displayName()).toBe('Gast');
  });

  it('lädt das Profil über GET /api/users/me nach', () => {
    service.syncFromKeycloak();

    const profile: CurrentUser = {
      username: 'admina',
      email: 'admina@example.ch',
      subject: 'abc-123',
      roles: [AppRole.ADMIN],
    };

    service.loadProfile().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(request.request.method).toBe('GET');
    request.flush(profile);

    expect(service.user()?.email).toBe('admina@example.ch');
    expect(service.isAdmin()).toBeTrue();
  });
});
