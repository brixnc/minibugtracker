import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap } from 'rxjs';

import { AppAuthService } from '../../service/app.auth.service';
import { ProjectService } from '../../service/project.service';
import { NotificationService } from '../../service/notification.service';
import { Project } from '../../data/project';
import { AppRoles } from '../../app.roles';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';

/**
 * Übersicht aller Projekte als Kartenraster.
 *
 * Anlegen, Bearbeiten und Löschen sind nur für ADMIN sichtbar - das
 * Backend schützt `POST`, `PUT` und `DELETE` auf `/api/projects`
 * mit `@PreAuthorize("hasRole('ADMIN')")`.
 */
@Component({
    selector: 'app-project-list',
    imports: [
        DatePipe,
        FormsModule,
        RouterLink,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatTooltipModule,
        AppIsInRolesDirective,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './project-list.component.html',
    styleUrl: './project-list.component.scss'
})
export class ProjectListComponent {
  private readonly projectService = inject(ProjectService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  protected readonly auth = inject(AppAuthService);

  protected readonly roles = AppRoles;
  protected readonly loading = signal(true);
  protected readonly search = signal('');

  private readonly projects = signal<Project[]>([]);

  /** Projekte, gefiltert nach dem Suchbegriff. */
  protected readonly visibleProjects = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (term.length === 0) {
      return this.projects();
    }
    return this.projects().filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        (project.description ?? '').toLowerCase().includes(term),
    );
  });

  /** `true`, wenn Projekte vorhanden sind, die Suche aber nichts findet. */
  protected readonly filteredToNothing = computed(
    () => this.projects().length > 0 && this.visibleProjects().length === 0,
  );

  constructor() {
    this.load();
  }

  /** Lädt alle Projekte vom Backend. */
  protected load(): void {
    this.loading.set(true);
    this.projectService.getList().subscribe({
      next: (projects) => {
        // Neue Array-Instanz, damit die Signal-Aenderung sicher erkannt wird
        // (Signale vergleichen mit Object.is).
        this.projects.set([...projects]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Initialen des Projektnamens für die Kachel. */
  protected initials(name: string): string {
    return name.slice(0, 2).toUpperCase();
  }

  /** Löscht ein Projekt nach Rückfrage (nur ADMIN). */
  protected remove(project: Project): void {
    const data: ConfirmDialogData = {
      title: 'Projekt löschen?',
      message: `"${project.name}" wird endgültig entfernt.`,
      confirmLabel: 'Löschen',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.projectService.delete(project.id) : [],
        ),
      )
      .subscribe(() => {
        this.notifications.success('Projekt gelöscht.');
        this.load();
      });
  }
}
