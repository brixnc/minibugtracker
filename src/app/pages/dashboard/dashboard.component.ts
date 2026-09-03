import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { AppAuthService } from '../../service/app.auth.service';
import { BugService } from '../../service/bug.service';
import { CommentService } from '../../service/comment.service';
import { ProjectService } from '../../service/project.service';
import { Bug, BugPriority, BugStatus } from '../../data/bug';
import { Project } from '../../data/project';
import { Comment } from '../../data/comment';
import { AppRoles } from '../../app.roles';
import { StatusChipComponent } from '../../components/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../components/priority-chip/priority-chip.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';

/**
 * Einstiegsseite nach der Anmeldung.
 *
 * Fasst die Daten aller drei Backend-Ressourcen zusammen und zeigt die
 * zuletzt gemeldeten Bugs. Der Hinweisblock am Ende erscheint nur für
 * die Rolle ADMIN (rollenabhängige Anzeige).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    StatusChipComponent,
    PriorityChipComponent,
    EmptyStateComponent,
    AppIsInRolesDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly bugService = inject(BugService);
  private readonly projectService = inject(ProjectService);
  private readonly commentService = inject(CommentService);
  protected readonly auth = inject(AppAuthService);

  protected readonly roles = AppRoles;
  protected readonly loading = signal(true);

  private readonly bugs = signal<Bug[]>([]);
  private readonly projects = signal<Project[]>([]);
  private readonly comments = signal<Comment[]>([]);

  /** Kennzahlen für die Kachelreihe. */
  protected readonly stats = computed(() => {
    const bugs = this.bugs();
    return [
      {
        key: 'projects',
        icon: 'folder',
        label: 'Projekte',
        value: this.projects().length,
        link: '/projekte',
      },
      {
        key: 'open',
        icon: 'error_outline',
        label: 'Offene Bugs',
        value: bugs.filter((bug) => bug.status === BugStatus.OPEN).length,
        link: '/bugs',
      },
      {
        key: 'high',
        icon: 'priority_high',
        label: 'Hohe Priorität',
        value: bugs.filter((bug) => bug.priority === BugPriority.HIGH).length,
        link: '/bugs',
      },
      {
        key: 'comments',
        icon: 'forum',
        label: 'Kommentare',
        value: this.comments().length,
        link: '/bugs',
      },
    ];
  });

  /** Verteilung der Bugs auf die drei Status-Werte, inklusive Prozentanteil. */
  protected readonly distribution = computed(() => {
    const bugs = this.bugs();
    const total = bugs.length || 1;
    return [
      BugStatus.OPEN,
      BugStatus.IN_PROGRESS,
      BugStatus.CLOSED,
    ].map((status) => {
      const count = bugs.filter((bug) => bug.status === status).length;
      return { status, count, percent: Math.round((count / total) * 100) };
    });
  });

  /** Die fünf zuletzt erfassten Bugs. */
  protected readonly latestBugs = computed(() =>
    [...this.bugs()]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 5),
  );

  /** Gesamtzahl aller Bugs. */
  protected readonly totalBugs = computed(() => this.bugs().length);

  constructor() {
    this.load();
  }

  /** Lädt alle Übersichtsdaten parallel. */
  protected load(): void {
    this.loading.set(true);
    forkJoin({
      bugs: this.bugService.getList(),
      projects: this.projectService.getList(),
      comments: this.commentService.getList(),
    }).subscribe({
      next: ({ bugs, projects, comments }) => {
        this.bugs.set([...bugs]);
        this.projects.set([...projects]);
        this.comments.set([...comments]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
