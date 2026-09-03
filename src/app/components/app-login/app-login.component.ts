import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AppAuthService } from '../../service/app.auth.service';

/**
 * Anmelde-Baustein für die Kopfzeile - im Demoprojekt des ÜK heisst er
 * ebenfalls `app-login` und wird dort genauso in die `<mat-toolbar>`
 * eingehängt:
 *
 * ```html
 * <mat-toolbar>
 *   <!-- ... -->
 *   <app-login></app-login>
 * </mat-toolbar>
 * ```
 *
 * Bewusst als eigene Komponente und nicht als weiterer Block in der
 * Kopfzeile: Login und Logout sind der einzige Ort, an dem die Oberfläche
 * den Anmeldezustand aktiv verändert. Getrennt davon bleibt die Kopfzeile
 * reine Navigation - und dieser Baustein lässt sich für sich testen.
 */
@Component({
    selector: 'app-login',
    imports: [RouterLink, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app-login.component.html',
    styleUrl: './app-login.component.scss'
})
export class AppLoginComponent {
  protected readonly auth = inject(AppAuthService);

  /** Leitet zur Login-Maske von Keycloak weiter. */
  protected login(): void {
    // Nach dem Login soll es direkt ins Dashboard gehen und nicht zurück
    // auf die öffentliche Startseite.
    this.auth.login('/dashboard');
  }

  /** Meldet den Benutzer bei Keycloak ab. */
  protected logout(): void {
    this.auth.logout();
  }
}
