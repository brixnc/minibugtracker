import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppAuthService } from '../service/app.auth.service';

/**
 * Leitet angemeldete Benutzer von der Startseite auf das Dashboard weiter.
 *
 * Dadurch ist das Dashboard faktisch die Hauptseite: Wer angemeldet ist und
 * `/` aufruft, landet ohne Zwischenschritt dort.
 *
 * Die oeffentliche Startseite bleibt trotzdem bestehen, denn sie wird nach
 * dem Abmelden gebraucht - Keycloak kehrt gemaess `postLogoutRedirectUri`
 * aus `app.auth.ts` auf `/` zurueck. Stuende dort `appCanActivate`, oeffnete
 * der Guard sofort wieder die Anmeldemaske und ein Abmelden waere gar nicht
 * moeglich. Deshalb ein eigener Guard, der nur umleitet und niemanden
 * anmeldet.
 */
export const appHomeRedirect: CanActivateFn = () => {
  const auth = inject(AppAuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
