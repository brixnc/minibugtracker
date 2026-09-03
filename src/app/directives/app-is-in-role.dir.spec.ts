import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { AppIsInRolesDirective } from './app-is-in-role.dir';
import { AppAuthService } from '../service/app.auth.service';
import { AppRoles } from '../app.roles';
import { OAuthServiceStub, fakeAccessToken } from '../service/oauth.stub';
import { describe, beforeEach, it, expect } from 'vitest';

/**
 * Test der rollenabhängigen Anzeige (Bewertungspunkt «Teile mindestens
 * einer Seite werden rollenabhängig angezeigt oder ausgeblendet»).
 *
 * Deckt zusätzlich ab, dass die Direktive schon beim ersten Durchlauf der
 * Änderungserkennung fehlerfrei arbeitet. Ein `input.required` würde dort
 * NG0950 werfen, weil Angular den Wert noch nicht gesetzt hat.
 */
@Component({
  standalone: true,
  imports: [AppIsInRolesDirective],
  template: `
    <div id="jeder">Für alle sichtbar</div>
    <div *appIsInRoles="['ADMIN']" id="nur-admin">Nur für ADMIN</div>
    <div *appIsInRoles="['USER', 'ADMIN']" id="beide">Für USER und ADMIN</div>
  `,
})
class HostComponent {}

describe('AppIsInRolesDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let oauth: OAuthServiceStub;
  let auth: AppAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
    auth = TestBed.inject(AppAuthService);
  });

  /** Baut die Testkomponente mit den angegebenen Realm-Rollen auf. */
  function render(roles: string[]): void {
    oauth.signIn(fakeAccessToken('testperson', roles));
    auth.syncFromToken();
    fixture = TestBed.createComponent(HostComponent);
    // Zweimal: Der erste Durchlauf setzt den Input, der zweite lässt den
    // Effect der Direktive die Ansicht aufbauen.
    fixture.detectChanges();
    fixture.detectChanges();
  }

  function has(id: string): boolean {
    return fixture.nativeElement.querySelector(`#${id}`) !== null;
  }

  it('läuft ohne Fehler durch die erste Änderungserkennung', () => {
    expect(() => render([AppRoles.User])).not.toThrow();
  });

  it('zeigt Bereiche ohne Rollenbindung immer an', () => {
    render([]);
    expect(has('jeder')).toBe(true);
  });

  it('blendet ADMIN-Bereiche für die Rolle USER aus', () => {
    render([AppRoles.User]);

    expect(has('nur-admin')).toBe(false);
    expect(has('beide')).toBe(true);
  });

  it('zeigt ADMIN-Bereiche für die Rolle ADMIN an', () => {
    render([AppRoles.Admin]);

    expect(has('nur-admin')).toBe(true);
    expect(has('beide')).toBe(true);
  });

  it('blendet alles Rollengebundene aus, wenn keine Rolle vorliegt', () => {
    render([]);

    expect(has('nur-admin')).toBe(false);
    expect(has('beide')).toBe(false);
  });

  it('reagiert auf einen Rollenwechsel zur Laufzeit', () => {
    render([AppRoles.User]);
    expect(has('nur-admin')).toBe(false);

    // Ohne erneutes Laden der Seite: Das Signal im AppAuthService ändert
    // sich, der Effect der Direktive baut die Ansicht nach.
    oauth.signIn(fakeAccessToken('testperson', [AppRoles.Admin]));
    auth.syncFromToken();
    fixture.detectChanges();

    expect(has('nur-admin')).toBe(true);
  });
});
