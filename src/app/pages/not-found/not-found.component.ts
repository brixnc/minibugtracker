import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Auffangroute für unbekannte URLs. */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-page state">
      <mat-icon class="state__icon">travel_explore</mat-icon>
      <h1 class="state__title">Seite nicht gefunden</h1>
      <p class="state__text app-muted">
        Diese Adresse gibt es in der Anwendung nicht (oder nicht mehr).
      </p>
      <a mat-flat-button color="primary" routerLink="/">
        <mat-icon>home</mat-icon>
        Zur Startseite
      </a>
    </div>
  `,
  styleUrl: '../forbidden/state.scss',
})
export class NotFoundComponent {}
