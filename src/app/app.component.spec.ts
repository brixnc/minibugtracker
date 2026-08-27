import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { KeycloakService } from 'keycloak-angular';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

/** Test der Wurzelkomponente inklusive Kopfzeile. */
describe('AppComponent', () => {
  class KeycloakServiceStub {
    isLoggedIn = () => false;
    getUsername = () => '';
    getUserRoles = () => [] as string[];
    updateToken = () => Promise.resolve(true);
    getToken = () => Promise.resolve('');
    login = () => Promise.resolve();
    logout = () => Promise.resolve();
  }

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KeycloakService, useClass: KeycloakServiceStub },
      ],
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
    const auth = TestBed.inject(AuthService);
    expect(auth.isAuthenticated()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Anmelden');
  });
});
