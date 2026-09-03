import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BUG_STATUS_LABELS, BugStatus } from '../../data/bug';

/**
 * Farbige Kennzeichnung des Bug-Status (OPEN / IN_PROGRESS / CLOSED).
 */
@Component({
  selector: 'app-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="app-chip" [class]="cssClass()">
      <span class="app-chip__dot"></span>
      {{ label() }}
    </span>
  `,
})
export class StatusChipComponent {
  /** Der darzustellende Status. */
  readonly status = input.required<BugStatus>();

  /** Deutsche Beschriftung des Status. */
  readonly label = computed(() => BUG_STATUS_LABELS[this.status()]);

  /** Passende Farbklasse aus `styles.scss`. */
  readonly cssClass = computed(() => {
    switch (this.status()) {
      case BugStatus.OPEN:
        return 'app-chip--open';
      case BugStatus.IN_PROGRESS:
        return 'app-chip--in-progress';
      case BugStatus.CLOSED:
        return 'app-chip--closed';
    }
  });
}
