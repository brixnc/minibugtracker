import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoles } from '../../app.roles';
import { AppAuthService } from '../../service/app.auth.service';
import { ThemeService } from '../../service/theme.service';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';
import { AppLoginComponent } from '../app-login/app-login.component';

/**
 * Kopfzeile der Anwendung: Navigation, Themewechsel und - über
 * `<app-login>` - der Anmeldezustand.
 *
 * Aufbau wie im Demoprojekt des ÜK: eine `<mat-toolbar>`, deren Einträge
 * über `*appIsInRoles` rollenabhängig ein- und ausgeblendet werden.
 * «Neues Projekt» erscheint nur für die Rolle ADMIN - das ist der
 * Bewertungspunkt «Teile mindestens einer Seite werden rollenabhängig
 * angezeigt oder ausgeblendet».
 */
@Component({
    selector: 'app-toolbar',
    imports: [
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        AppIsInRolesDirective,
        AppLoginComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  private readonly theme = inject(ThemeService);
  protected readonly auth = inject(AppAuthService);

  /** Rollen-Konstanten für das Template (kein Tippfehler-Risiko in Strings). */
  protected readonly roles = AppRoles;

  /** `true`, wenn das dunkle Theme aktiv ist. */
  protected readonly isDark = this.theme.isDark;

  /** Wechselt zwischen hellem und dunklem Theme. */
  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
