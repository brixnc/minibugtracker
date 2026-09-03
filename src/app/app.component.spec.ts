import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { AppAuthService } from './service/app.auth.service';
import { AppRoles } from './app.roles';
import { OAuthServiceStub, fakeAccessToken } from './service/oauth.stub';
import { describe, beforeEach, it, expect } from 'vitest';

/** Test der Wurzelkomponente inklusive Kopfzeile und Anmelde-Baustein. */
describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('wird erzeugt', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('trägt den Anwendungstitel', () => {
    expect(fixture.componentInstance.title).toBe('MiniBugTracker');
  });

  it('zeigt die Kopfzeile mit dem Namen der Anwendung', () => {
    expect(fixture.nativeElement.querySelector('app-toolbar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('MiniBugTracker');
  });

  it('bietet abgemeldeten Besuchern die Anmeldung an', () => {
    const auth = TestBed.inject(AppAuthService);
    expect(auth.isAuthenticated()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-login')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Anmelden');
  });
});

/** Platzhalterseiten, damit der Router im Test etwas anzusteuern hat. */
@Component({ selector: 'app-start-stub', standalone: true, template: 'start' })
class StartStubComponent {}

@Component({ selector: 'app-bugs-stub', standalone: true, template: 'bugs' })
class BugsStubComponent {}

/**
 * Weiterleitung nach dem Login.
 *
 * Keycloak kehrt immer zur festen `redirectUri` zurück. Das eigentliche
 * Ziel reist als OAuth-`state` mit - hier wird geprüft, dass es auch
 * wirklich angesteuert wird, und zwar erst nach der ersten Navigation des
 * Routers.
 */
describe('AppComponent - Rücksprung nach dem Login', () => {
  let oauth: OAuthServiceStub;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: StartStubComponent },
          { path: 'bugs/:id', component: BugsStubComponent },
        ]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
    router = TestBed.inject(Router);
  });

  it('steuert die gemerkte Adresse an', async () => {
    oauth.signIn(fakeAccessToken('testuser', [AppRoles.User]));
    oauth.state = '/bugs/7';
    TestBed.inject(AppAuthService).syncFromToken();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Die erste Navigation des Routers - erst danach greift der Rücksprung.
    await router.navigateByUrl('/');
    await fixture.whenStable();

    expect(router.url).toBe('/bugs/7');
  });

  it('bleibt auf der Startseite, wenn nichts gemerkt wurde', async () => {
    oauth.signIn(fakeAccessToken('testuser', [AppRoles.User]));
    TestBed.inject(AppAuthService).syncFromToken();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    await router.navigateByUrl('/');
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });

  it('leitet nicht weiter, solange niemand angemeldet ist', async () => {
    // Ein State ohne gueltiges Token darf keine Weiterleitung ausloesen.
    oauth.state = '/bugs/7';

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    await router.navigateByUrl('/');
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });
});
