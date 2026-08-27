import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { KeycloakService } from 'keycloak-angular';

import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '../services/auth.service';
import { AppRole } from '../models/user.model';

/**
 * Test der rollenabhängigen Anzeige.
 *
 * Deckt zusätzlich ab, dass die Direktive schon beim ersten Durchlauf der
 * Änderungserkennung fehlerfrei arbeitet. Ein `input.required` würde dort
 * NG0950 werfen, weil Angular den Wert noch nicht gesetzt hat.
 */
@Component({
  standalone: true,
  imports: [HasRoleDirective],
  template: `
    <div id="jeder">Für alle sichtbar</div>
    <div *appHasRole="['ADMIN']" id="nur-admin">Nur für ADMIN</div>
    <div *appHasRole="['USER', 'ADMIN']" id="beide">Für USER und ADMIN</div>
  `,
})
class HostComponent {}

describe('HasRoleDirective', () => {
  class KeycloakServiceStub {
    roles: string[] = [];
    isLoggedIn = () => true;
    getUsername = () => 'testperson';
    getUserRoles = () => this.roles;
    updateToken = () => Promise.resolve(true);
    getToken = () => Promise.resolve('test-token');
  }

  let fixture: ComponentFixture<HostComponent>;
  let keycloak: KeycloakServiceStub;
  let auth: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KeycloakService, useClass: KeycloakServiceStub },
      ],
    }).compileComponents();

    keycloak = TestBed.inject(KeycloakService) as unknown as KeycloakServiceStub;
    auth = TestBed.inject(AuthService);
  });

  /** Baut die Testkomponente mit den angegebenen Realm-Rollen auf. */
  function render(roles: string[]): void {
    keycloak.roles = roles;
    auth.syncFromKeycloak();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
  }

  function has(id: string): boolean {
    return fixture.nativeElement.querySelector(`#${id}`) !== null;
  }

  it('läuft ohne Fehler durch die erste Änderungserkennung', () => {
    expect(() => render([AppRole.USER])).not.toThrow();
  });

  it('zeigt Bereiche ohne Rollenbindung immer an', () => {
    render([]);
    expect(has('jeder')).toBeTrue();
  });

  it('blendet ADMIN-Bereiche für die Rolle USER aus', () => {
    render([AppRole.USER]);

    expect(has('nur-admin')).toBeFalse();
    expect(has('beide')).toBeTrue();
  });

  it('zeigt ADMIN-Bereiche für die Rolle ADMIN an', () => {
    render([AppRole.ADMIN]);

    expect(has('nur-admin')).toBeTrue();
    expect(has('beide')).toBeTrue();
  });

  it('blendet alles Rollengebundene aus, wenn keine Rolle vorliegt', () => {
    render([]);

    expect(has('nur-admin')).toBeFalse();
    expect(has('beide')).toBeFalse();
  });

  it('reagiert auf einen Rollenwechsel zur Laufzeit', () => {
    render([AppRole.USER]);
    expect(has('nur-admin')).toBeFalse();

    keycloak.roles = [AppRole.ADMIN];
    auth.syncFromKeycloak();
    fixture.detectChanges();

    expect(has('nur-admin')).toBeTrue();
  });
});
