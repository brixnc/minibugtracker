import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { AuthConfig, OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { authConfig } from './app.auth';
import { environment } from '../environments/environment';
import { errorInterceptor } from './interceptors/error.interceptor';
import { AppAuthService } from './service/app.auth.service';
import { germanPaginatorIntl } from './paginator-intl';

/**
 * Speicherort für Tokens.
 *
 * `sessionStorage` statt `localStorage` - wie im Demoprojekt des ÜK. Der
 * Token verschwindet damit beim Schliessen des Tabs und überlebt nicht in
 * einem gemeinsam genutzten Browser. Das ist die vorsichtigere Wahl; der
 * Preis ist, dass ein neuer Tab eine neue Anmeldung braucht.
 */
export function storageFactory(): OAuthStorage {
  return sessionStorage;
}

/**
 * Startet OAuth 2, bevor die Anwendung gerendert wird.
 *
 * Im Demoprojekt (Angular 21) steht dafür
 * `provideEnvironmentInitializer(() => inject(AppAuthService).initAuth())`.
 * Dieses Projekt läuft auf Angular 18, wo es diese Kurzform noch nicht
 * gibt - `APP_INITIALIZER` bewirkt dasselbe.
 */
function initializeAuth(auth: AppAuthService) {
  return (): Promise<void> => auth.initAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Bindet Routenparameter direkt an gleichnamige `input()` der
      // Komponente - deshalb genügt in BugDetail ein `id = input.required()`
      // statt der Auswertung von `ActivatedRoute`.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideAnimationsAsync(),

    provideHttpClient(
      // Übersetzt HTTP-Fehler des Backends in verständliche Meldungen.
      // Der Bearer-Token kommt nicht mehr von hier, sondern vom
      // `resourceServer` weiter unten.
      withInterceptors([errorInterceptor]),

      // Bindet den Interceptor ein, den `provideOAuthClient` weiter unten
      // klassisch über `HTTP_INTERCEPTORS` registriert. Ohne diese Zeile
      // kennt `provideHttpClient` nur die oben aufgezählten Funktionen,
      // der Access-Token wird nie angehängt und jeder Aufruf an das
      // Backend endet mit HTTP 401.
      withInterceptorsFromDi(),

      // XSRF-Schutz, wie in der Wegleitung zur Projektarbeit aufgeführt.
      // Dieses Backend arbeitet zustandslos mit JWT und schaltet CSRF ab
      // (`SecurityConfig`), es setzt also gar kein XSRF-TOKEN-Cookie.
      // Angular sendet den Header dann schlicht nicht mit. Die Angabe
      // bleibt trotzdem stehen: Sobald das Backend CSRF einschaltet,
      // funktioniert das Frontend ohne weitere Änderung.
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),

    // Die AuthConfig auch als Provider bereitstellen, damit der
    // OAuthService sie bereits bei seiner Erzeugung kennt.
    { provide: AuthConfig, useValue: authConfig },
    { provide: OAuthStorage, useFactory: storageFactory },

    /**
     * Hängt den Access-Token automatisch an jeden Request, dessen URL mit
     * `backendBaseUrl` beginnt. Requests an Keycloak selbst bleiben
     * unberührt - dort wird der Token überhaupt erst ausgestellt.
     */
    provideOAuthClient({
      resourceServer: {
        sendAccessToken: true,
        allowedUrls: [environment.backendBaseUrl],
      },
    }),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [AppAuthService],
    },

    // --- Darstellung -----------------------------------------------------
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
    { provide: MAT_CARD_CONFIG, useValue: { appearance: 'outlined' } },
    { provide: MatPaginatorIntl, useFactory: germanPaginatorIntl },
  ],
};
