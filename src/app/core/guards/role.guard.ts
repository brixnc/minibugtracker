import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Rollenprüfung für den Angular Router.
 *
 * Die erlaubten Realm-Rollen stehen an der Route unter `data.roles`:
 *
 * ```ts
 * {
 *   path: 'projekte/neu',
 *   component: ProjectFormComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [AppRole.ADMIN] }
 * }
 * ```
 *
 * Der Guard ist bewusst nur die erste Verteidigungslinie für die Oberfläche.
 * Verbindlich entscheidet das Backend über `@PreAuthorize`.
 */
export const roleGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloak.isLoggedIn()) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return router.createUrlTree(['/']);
  }

  const required = (route.data['roles'] as string[] | undefined) ?? [];
  if (required.length === 0) {
    return true;
  }

  const userRoles = keycloak.getUserRoles(true);
  const allowed = required.some((role) => userRoles.includes(role));

  return allowed ? true : router.createUrlTree(['/kein-zugriff']);
};
