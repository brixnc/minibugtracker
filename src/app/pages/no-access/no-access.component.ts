import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppAuthService } from '../../service/app.auth.service';

/**
 * Wird angezeigt, wenn der `roleGuard` eine Route blockiert oder das
 * Backend mit HTTP 403 antwortet.
 */
@Component({
    selector: 'app-no-access',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="app-page state">
      <mat-icon class="state__icon">lock</mat-icon>
      <h1 class="state__title">Kein Zugriff</h1>
      <p class="state__text app-muted">
        Für diese Seite fehlt die nötige Berechtigung. Sie ist der Rolle
        <strong>ADMIN</strong> vorbehalten.
      </p>
      <p class="state__roles app-muted">
        Angemeldet als <strong>{{ auth.displayName() }}</strong> mit den Rollen:
        {{ auth.roles().length ? auth.roles().join(', ') : 'keine' }}
      </p>
      <a mat-flat-button color="primary" routerLink="/dashboard">
        <mat-icon>arrow_back</mat-icon>
        Zurück zum Dashboard
      </a>
    </div>
  `,
    styleUrl: './state.scss'
})
export class NoAccessComponent {
  protected readonly auth = inject(AppAuthService);
}
