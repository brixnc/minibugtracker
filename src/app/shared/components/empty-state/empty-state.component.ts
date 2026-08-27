import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Platzhalter für leere Listen. Sorgt dafür, dass eine Seite ohne Daten
 * nicht wie ein Ladefehler aussieht.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <mat-icon class="empty__icon">{{ icon() }}</mat-icon>
      <p class="empty__title">{{ title() }}</p>
      @if (hint()) {
        <p class="empty__hint app-muted">{{ hint() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 56px 24px;
        text-align: center;
      }

      .empty__icon {
        width: 44px;
        height: 44px;
        font-size: 44px;
        opacity: 0.35;
        margin-bottom: 6px;
      }

      .empty__title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .empty__hint {
        margin: 0;
        font-size: 14px;
        max-width: 46ch;
      }
    `,
  ],
})
export class EmptyStateComponent {
  /** Material-Icon oberhalb des Textes. */
  readonly icon = input<string>('inbox');

  /** Hauptaussage, z. B. "Noch keine Bugs erfasst". */
  readonly title = input.required<string>();

  /** Optionaler Zusatzhinweis. */
  readonly hint = input<string>('');
}
