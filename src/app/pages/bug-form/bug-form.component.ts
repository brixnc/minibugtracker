import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { BugService } from '../../service/bug.service';
import { NotificationService } from '../../service/notification.service';
import {
  BUG_CONSTRAINTS,
  BUG_PRIORITY_LABELS,
  BUG_PRIORITY_OPTIONS,
  BUG_STATUS_LABELS,
  BUG_STATUS_OPTIONS,
  BugPayload,
  BugPriority,
  BugStatus,
} from '../../data/bug';

/**
 * Formular zum Erfassen und Bearbeiten eines Bugs.
 *
 * Die Validierungsregeln entsprechen exakt den Bean-Validation-Annotationen
 * der Entity `Bug.java`, damit das Backend keine überraschenden 400er
 * zurückgibt:
 *  - Titel: Pflichtfeld, 3 bis 100 Zeichen
 *  - Beschreibung: höchstens 500 Zeichen
 *  - Status und Priorität: Pflichtfelder aus der jeweiligen Auswahl
 */
@Component({
    selector: 'app-bug-form',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './bug-form.component.html',
    styleUrl: './bug-form.component.scss'
})
export class BugFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly bugService = inject(BugService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /** Route-Parameter `:id` - gesetzt, wenn ein bestehender Bug bearbeitet wird. */
  readonly id = input<string | undefined>(undefined);

  protected readonly constraints = BUG_CONSTRAINTS;
  protected readonly statusOptions = BUG_STATUS_OPTIONS;
  protected readonly priorityOptions = BUG_PRIORITY_OPTIONS;
  protected readonly statusLabels = BUG_STATUS_LABELS;
  protected readonly priorityLabels = BUG_PRIORITY_LABELS;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  /** `true`, sobald ein bestehender Datensatz bearbeitet wird. */
  protected readonly isEdit = computed(() => this.id() !== undefined);

  /** Formulardefinition inklusive Validatoren. */
  protected readonly form = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(BUG_CONSTRAINTS.titleMinLength),
        Validators.maxLength(BUG_CONSTRAINTS.titleMaxLength),
      ],
    ],
    description: ['', [Validators.maxLength(BUG_CONSTRAINTS.descriptionMaxLength)]],
    status: [BugStatus.OPEN, [Validators.required]],
    priority: [BugPriority.MEDIUM, [Validators.required]],
  });

  constructor() {
    // Beim Bearbeiten den bestehenden Datensatz nachladen. Bewusst über
    // `toObservable` statt über `effect`: In einem Effect sind
    // Schreibzugriffe auf Signale nicht erlaubt (NG0600).
    toObservable(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        if (id === undefined) {
          return;
        }
        this.loadBug(Number(id));
      });
  }

  /** Aktuelle Länge der Beschreibung für die Zeichenanzeige. */
  protected get descriptionLength(): number {
    return this.form.controls.description.value.length;
  }

  /** Speichert das Formular (POST beim Anlegen, PUT beim Bearbeiten). */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.error('Bitte die markierten Felder korrigieren.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: BugPayload = {
      title: raw.title.trim(),
      description: raw.description.trim() === '' ? null : raw.description.trim(),
      status: raw.status,
      priority: raw.priority,
    };

    this.saving.set(true);
    const id = this.id();
    const request$ =
      id === undefined
        ? this.bugService.create(payload)
        : this.bugService.update(Number(id), payload);

    request$.subscribe({
      next: (bug) => {
        this.saving.set(false);
        this.notifications.success(id === undefined ? 'Bug erfasst.' : 'Bug aktualisiert.');
        void this.router.navigate(['/bugs', bug.id]);
      },
      error: () => this.saving.set(false),
    });
  }

  /** Bricht ab und kehrt zur Liste zurück. */
  protected cancel(): void {
    void this.router.navigate(['/bugs']);
  }

  private loadBug(id: number): void {
    this.loading.set(true);
    this.bugService.getOne(id).subscribe({
      next: (bug) => {
        this.form.patchValue({
          title: bug.title,
          description: bug.description ?? '',
          status: bug.status,
          priority: bug.priority,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        void this.router.navigate(['/bugs']);
      },
    });
  }
}
