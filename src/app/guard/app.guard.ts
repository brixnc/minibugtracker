import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppAuthService } from '../service/app.auth.service';

/**
 * Router-Guard für Anmeldung und Rollenprüfung.
 *
 * Entspricht `appCanActivate` aus dem Demoprojekt des ÜK: ein einziger
 * Guard, der beides erledigt. Die erlaubten Realm-Rollen stehen an der
 * Route unter `data.roles`:
 *
 * ```ts
 * {
 *   path: 'projekte/neu',
 *   canActivate: [appCanActivate],
 *   data: { roles: [AppRoles.Admin] },
 *   loadComponent: () => import('./pages/project-form/project-form.component')
 *       .then((m) => m.ProjectFormComponent),
 * }
 * ```
 *
 * Ablauf:
 *  1. Nicht angemeldet  -> Login-Maske von Keycloak, danach zurück auf die
 *     ursprünglich gewünschte Seite (die URL reist als OAuth-`state` mit).
 *  2. Angemeldet, Rolle fehlt -> Seite `/noaccess`.
 *  3. Sonst -> Zugriff erlaubt.
 *
 * Der Guard ist bewusst nur die erste Verteidigungslinie für die
 * Oberfläche. Verbindlich entscheidet das Backend über `@PreAuthorize`;
 * ein manipulierter Browser kommt also trotzdem nicht weiter.
 */
export const appCanActivate: CanActivateFn = (route, state) => {
  const auth = inject(AppAuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    auth.login(state.url);
    // Die Weiterleitung zu Keycloak verlässt die Anwendung ohnehin. Bis es
    // so weit ist, wird die Navigation hier sauber abgebrochen.
    return false;
  }

  // `route.data` ist über einen Index-Zugriff typisiert, deshalb die
  // Umwandlung. Fehlt `roles`, gilt: angemeldet sein genügt.
  const required = (route.data['roles'] as string[] | undefined) ?? [];

  return auth.isInRoles(required) ? true : router.createUrlTree(['/noaccess']);
};
