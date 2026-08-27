import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PROJECT_CONSTRAINTS, ProjectPayload } from '../../../core/models/project.model';

/**
 * Formular zum Anlegen und Bearbeiten eines Projekts.
 *
 * Die Route ist über `roleGuard` der Rolle ADMIN vorbehalten. Die
 * Validierungsregeln entsprechen der Entity `Project.java`:
 *  - Name: Pflichtfeld, 2 bis 100 Zeichen
 *  - Beschreibung: höchstens 300 Zeichen
 */
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /** Route-Parameter `:id` - gesetzt beim Bearbeiten. */
  readonly id = input<string | undefined>(undefined);

  protected readonly constraints = PROJECT_CONSTRAINTS;
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  /** `true`, sobald ein bestehendes Projekt bearbeitet wird. */
  protected readonly isEdit = computed(() => this.id() !== undefined);

  protected readonly form = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(PROJECT_CONSTRAINTS.nameMinLength),
        Validators.maxLength(PROJECT_CONSTRAINTS.nameMaxLength),
      ],
    ],
    description: ['', [Validators.maxLength(PROJECT_CONSTRAINTS.descriptionMaxLength)]],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id === undefined) {
        return;
      }
      this.loadProject(Number(id));
    });
  }

  /** Aktuelle Länge der Beschreibung. */
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
    const payload: ProjectPayload = {
      name: raw.name.trim(),
      description: raw.description.trim() === '' ? null : raw.description.trim(),
    };

    this.saving.set(true);
    const id = this.id();
    const request$ =
      id === undefined
        ? this.projectService.create(payload)
        : this.projectService.update(Number(id), payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success(
          id === undefined ? 'Projekt angelegt.' : 'Projekt aktualisiert.',
        );
        void this.router.navigate(['/projekte']);
      },
      error: () => this.saving.set(false),
    });
  }

  /** Bricht ab und kehrt zur Übersicht zurück. */
  protected cancel(): void {
    void this.router.navigate(['/projekte']);
  }

  private loadProject(id: number): void {
    this.loading.set(true);
    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.form.patchValue({
          name: project.name,
          description: project.description ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        void this.router.navigate(['/projekte']);
      },
    });
  }
}
