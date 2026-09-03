import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

import { appHomeRedirect } from './app.home.guard';
import { AppAuthService } from '../service/app.auth.service';
import { AppRoles } from '../app.roles';
import { OAuthServiceStub, fakeAccessToken } from '../service/oauth.stub';

/**
 * Test der Weiterleitung von der Startseite.
 *
 * Angemeldete Benutzer sollen direkt auf dem Dashboard landen, abgemeldete
 * die oeffentliche Startseite sehen. Der zweite Fall ist der wichtigere:
 * Keycloak kehrt nach dem Abmelden auf `/` zurueck. Wuerde der Guard dort
 * auch abgemeldete Besucher wegschicken, waere ein Abmelden nicht moeglich.
 */
describe('appHomeRedirect', () => {
  let auth: AppAuthService;
  let oauth: OAuthServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppAuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
    });

    auth = TestBed.inject(AppAuthService);
    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
  });

  /** Ruft den Guard im Injektionskontext auf. */
  function run(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      appHomeRedirect({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as boolean | UrlTree;
  }

  it('laesst abgemeldete Besucher auf die Startseite', () => {
    auth.syncFromToken();

    expect(run()).toBe(true);
  });

  it('leitet angemeldete Benutzer auf das Dashboard weiter', () => {
    oauth.signIn(fakeAccessToken('testuser', [AppRoles.User]));
    auth.syncFromToken();

    const result = run();

    expect(result instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
