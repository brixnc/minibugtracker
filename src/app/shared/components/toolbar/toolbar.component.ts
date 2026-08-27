import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';
import { AppRole } from '../../../core/models/user.model';

/**
 * Kopfzeile der Anwendung: Navigation, Themewechsel sowie Login/Logout.
 *
 * Der Navigationspunkt "Neues Projekt" ist ein Beispiel für eine
 * rollenabhängige Anzeige - er erscheint nur für die Rolle ADMIN.
 */
@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    HasRoleDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);

  /** Rollen-Konstanten für das Template. */
  protected readonly roles = AppRole;

  /** `true`, wenn das dunkle Theme aktiv ist. */
  protected readonly isDark = this.theme.isDark;

  /** Wechselt zwischen hellem und dunklem Theme. */
  protected toggleTheme(): void {
    this.theme.toggle();
  }

  /** Startet den OAuth-2-Anmeldevorgang bei Keycloak. */
  protected login(): void {
    void this.auth.login();
  }

  /** Meldet den Benutzer bei Keycloak ab. */
  protected logout(): void {
    void this.auth.logout();
  }
}
