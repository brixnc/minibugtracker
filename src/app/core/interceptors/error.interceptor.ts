import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Übersetzt HTTP-Fehler des Backends in verständliche Meldungen.
 *
 * Besonders relevant für die Rollentrennung: Ein `403` bedeutet, dass das
 * Token gültig ist, die Realm-Rolle für diesen Endpunkt aber nicht reicht
 * (z. B. USER versucht `PUT /api/bugs/{id}`, das nur ADMIN darf).
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.error(describe(error, auth.isAuthenticated()));

      if (error.status === 403) {
        void router.navigate(['/kein-zugriff']);
      }

      return throwError(() => error);
    }),
  );
};

/** Baut aus dem HTTP-Fehler eine Meldung in der Sprache der Oberfläche. */
function describe(error: HttpErrorResponse, authenticated: boolean): string {
  switch (error.status) {
    case 0:
      return 'Das Backend ist nicht erreichbar. Läuft es auf http://localhost:9090?';
    case 400:
      return `Ungültige Eingabe: ${backendMessage(error) ?? 'Bitte Formular prüfen.'}`;
    case 401:
      return authenticated
        ? 'Die Anmeldung ist abgelaufen. Bitte erneut anmelden.'
        : 'Für diese Aktion ist eine Anmeldung nötig.';
    case 403:
      return 'Keine Berechtigung: Diese Aktion ist der Rolle ADMIN vorbehalten.';
    case 404:
      return backendMessage(error) ?? 'Der Datensatz wurde nicht gefunden.';
    case 500:
      return 'Im Backend ist ein Fehler aufgetreten.';
    default:
      return backendMessage(error) ?? `Unerwarteter Fehler (HTTP ${error.status}).`;
  }
}

/** Liest die Fehlermeldung aus dem Antwort-Body von Spring Boot. */
function backendMessage(error: HttpErrorResponse): string | null {
  const body = error.error as { message?: string; detail?: string } | string | null;
  if (typeof body === 'string' && body.length > 0) {
    return body;
  }
  if (body && typeof body === 'object') {
    return body.message ?? body.detail ?? null;
  }
  return null;
}
