import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';

/**
 * Startet Keycloak, bevor die Anwendung gerendert wird.
 *
 * `check-sso` prüft still im Hintergrund, ob bereits eine Sitzung besteht.
 * Dadurch landet ein bereits angemeldeter Benutzer direkt in der Anwendung,
 * ohne erneut die Login-Maske zu sehen.
 *
 * Schlägt der Start fehl (Keycloak nicht erreichbar), startet die Anwendung
 * trotzdem - dann allerdings abgemeldet. So bleibt die Startseite bedienbar
 * und der Benutzer erhält eine verständliche Meldung statt eines weissen
 * Bildschirms.
 */
function initializeKeycloak(keycloak: KeycloakService, auth: AuthService) {
  return async (): Promise<void> => {
    try {
      await keycloak.init({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId,
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          checkLoginIframe: false,
          pkceMethod: 'S256',
        },
        // Der Bearer-Token wird von unserem eigenen `authInterceptor` gesetzt.
        enableBearerInterceptor: false,
      });
    } catch {
      console.warn(
        '[Keycloak] Start fehlgeschlagen. Läuft der Server auf ' +
          `${environment.keycloak.url} mit dem Realm "${environment.keycloak.realm}"?`,
      );
    }

    auth.syncFromKeycloak();

    // Profil vom Backend nachladen - belegt, dass das Token akzeptiert wird.
    auth.loadProfile().subscribe();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, AuthService],
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
    { provide: MAT_CARD_CONFIG, useValue: { appearance: 'outlined' } },
  ],
};
