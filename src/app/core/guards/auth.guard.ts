import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Schützt Routen, die eine Anmeldung voraussetzen.
 *
 * Ist der Benutzer nicht angemeldet, wird direkt die Login-Maske von
 * Keycloak geöffnet und danach auf die ursprünglich gewünschte Seite
 * zurückgekehrt.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  if (keycloak.isLoggedIn()) {
    return true;
  }

  await keycloak.login({
    redirectUri: window.location.origin + state.url,
  });

  return router.createUrlTree(['/']);
};
