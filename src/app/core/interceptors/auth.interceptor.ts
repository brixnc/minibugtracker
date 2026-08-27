import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Token-basierte Security (OAuth 2 / OpenID Connect).
 *
 * Hängt an jeden Request an das eigene Backend den `Authorization`-Header
 * mit dem aktuellen Keycloak-Access-Token. `AuthService.getToken()` erneuert
 * das Token vorher, falls es in weniger als 30 Sekunden abläuft.
 *
 * Requests an Keycloak selbst bleiben unberührt - dort wird das Token
 * überhaupt erst ausgestellt.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  const goesToKeycloak = request.url.includes('/realms/');
  if (goesToKeycloak || !auth.isAuthenticated()) {
    return next(request);
  }

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(request);
      }
      const authorized = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authorized);
    }),
  );
};
