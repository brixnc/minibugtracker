import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Dünner Wrapper um `MatSnackBar`, damit Erfolgs- und Fehlermeldungen
 * in der ganzen Anwendung gleich aussehen.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /** Grüne Bestätigung. */
  success(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3500,
      panelClass: ['app-snackbar', 'app-snackbar--success'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  /** Rote Fehlermeldung. */
  error(message: string): void {
    this.snackBar.open(message, 'Schliessen', {
      duration: 6000,
      panelClass: ['app-snackbar', 'app-snackbar--error'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  /** Neutraler Hinweis. */
  info(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: ['app-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
