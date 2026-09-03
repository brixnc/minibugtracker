import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { BUG_PRIORITY_LABELS, BugPriority } from '../../data/bug';

/**
 * Farbige Kennzeichnung der Bug-Priorität (LOW / MEDIUM / HIGH).
 */
@Component({
  selector: 'app-priority-chip',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="app-chip" [class]="cssClass()">
      <mat-icon class="icon">{{ icon() }}</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .icon {
        width: 15px;
        height: 15px;
        font-size: 15px;
        line-height: 15px;
      }
    `,
  ],
})
export class PriorityChipComponent {
  /** Die darzustellende Priorität. */
  readonly priority = input.required<BugPriority>();

  /** Deutsche Beschriftung der Priorität. */
  readonly label = computed(() => BUG_PRIORITY_LABELS[this.priority()]);

  /** Passende Farbklasse aus `styles.scss`. */
  readonly cssClass = computed(() => {
    switch (this.priority()) {
      case BugPriority.HIGH:
        return 'app-chip--high';
      case BugPriority.MEDIUM:
        return 'app-chip--medium';
      case BugPriority.LOW:
        return 'app-chip--low';
    }
  });

  /** Material-Icon je Priorität. */
  readonly icon = computed(() => {
    switch (this.priority()) {
      case BugPriority.HIGH:
        return 'keyboard_double_arrow_up';
      case BugPriority.MEDIUM:
        return 'drag_handle';
      case BugPriority.LOW:
        return 'keyboard_double_arrow_down';
    }
  });
}
