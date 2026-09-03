import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap } from 'rxjs';

import { AppAuthService } from '../../service/app.auth.service';
import { BugService } from '../../service/bug.service';
import { NotificationService } from '../../service/notification.service';
import {
  BUG_PRIORITY_LABELS,
  BUG_PRIORITY_OPTIONS,
  BUG_STATUS_LABELS,
  BUG_STATUS_OPTIONS,
  Bug,
  BugPriority,
  BugStatus,
} from '../../data/bug';
import { AppRoles } from '../../app.roles';
import { StatusChipComponent } from '../../components/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../components/priority-chip/priority-chip.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';

/**
 * Übersicht aller Bugs als sortier- und filterbare Material-Tabelle.
 *
 * Die Spalte "Aktionen" enthält Bearbeiten und Löschen - beide sind über
 * `*appIsInRoles` nur für die Rolle ADMIN sichtbar, weil das Backend
 * `PUT` und `DELETE` mit `@PreAuthorize("hasRole('ADMIN')")` schützt.
 */
@Component({
  selector: 'app-bug-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    StatusChipComponent,
    PriorityChipComponent,
    EmptyStateComponent,
    AppIsInRolesDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bug-list.component.html',
  styleUrl: './bug-list.component.scss',
})
export class BugListComponent implements AfterViewInit {
  private readonly bugService = inject(BugService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  protected readonly auth = inject(AppAuthService);

  @ViewChild(MatSort) private sort?: MatSort;
  @ViewChild(MatPaginator) private paginator?: MatPaginator;

  protected readonly roles = AppRoles;
  protected readonly statusOptions = BUG_STATUS_OPTIONS;
  protected readonly priorityOptions = BUG_PRIORITY_OPTIONS;
  protected readonly statusLabels = BUG_STATUS_LABELS;
  protected readonly priorityLabels = BUG_PRIORITY_LABELS;

  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<BugStatus | 'ALL'>('ALL');
  protected readonly priorityFilter = signal<BugPriority | 'ALL'>('ALL');

  private readonly bugs = signal<Bug[]>([]);

  /** Spalten der Material-Tabelle. */
  protected readonly displayedColumns = ['title', 'status', 'priority', 'createdAt', 'actions'];

  /** Datenquelle der Tabelle - hält Sortierung und Seitenwechsel. */
  protected readonly dataSource = new MatTableDataSource<Bug>([]);

  /** Anzahl Treffer nach Anwendung der Filter. */
  protected readonly resultCount = computed(() => this.filtered().length);

  /** `true`, wenn Daten vorhanden sind, die Filter aber nichts übrig lassen. */
  protected readonly filteredToNothing = computed(
    () => this.bugs().length > 0 && this.filtered().length === 0,
  );

  private readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.bugs().filter((bug) => {
      const matchesTerm =
        term.length === 0 ||
        bug.title.toLowerCase().includes(term) ||
        (bug.description ?? '').toLowerCase().includes(term);
      const matchesStatus = status === 'ALL' || bug.status === status;
      const matchesPriority = priority === 'ALL' || bug.priority === priority;
      return matchesTerm && matchesStatus && matchesPriority;
    });
  });

  constructor() {
    this.load();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  /** Lädt alle Bugs vom Backend. */
  protected load(): void {
    this.loading.set(true);
    this.bugService.getList().subscribe({
      next: (bugs) => {
        // Bewusst eine neue Array-Instanz: Signale vergleichen mit Object.is.
        // Kaeme zweimal dieselbe Instanz an, wuerde die Aenderung nicht
        // erkannt und die Tabelle bliebe auf dem alten Stand stehen.
        this.bugs.set([...bugs]);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Übernimmt den Suchbegriff aus dem Eingabefeld. */
  protected onSearch(value: string): void {
    this.search.set(value);
    this.applyFilters();
  }

  /** Übernimmt den Statusfilter. */
  protected onStatusFilter(value: BugStatus | 'ALL'): void {
    this.statusFilter.set(value);
    this.applyFilters();
  }

  /** Übernimmt den Prioritätsfilter. */
  protected onPriorityFilter(value: BugPriority | 'ALL'): void {
    this.priorityFilter.set(value);
    this.applyFilters();
  }

  /** Setzt alle Filter zurück. */
  protected resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('ALL');
    this.priorityFilter.set('ALL');
    this.applyFilters();
  }

  /** Oeffnet die Detailansicht eines Bugs. */
  protected openDetail(bug: Bug): void {
    void this.router.navigate(['/bugs', bug.id]);
  }

  /**
   * Löscht einen Bug nach Rückfrage.
   * Serverseitig ist die Aktion der Rolle ADMIN vorbehalten.
   */
  protected remove(bug: Bug, event: Event): void {
    // Die Zeile selbst oeffnet die Detailansicht - der Klick auf
    // "Loeschen" darf nicht zusaetzlich dorthin navigieren.
    event.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Bug löschen?',
      message: `"${bug.title}" wird endgültig entfernt. Diese Aktion lässt sich nicht rückgängig machen.`,
      confirmLabel: 'Löschen',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .pipe(
        switchMap((confirmed) =>
          // Bei "Abbrechen" liefert switchMap ein leeres Array - daraus
          // entsteht ein sofort abgeschlossenes Observable, es passiert nichts.
          confirmed ? this.bugService.delete(bug.id) : [],
        ),
      )
      .subscribe(() => {
        this.notifications.success('Bug gelöscht.');
        this.load();
      });
  }

  private applyFilters(): void {
    this.dataSource.data = this.filtered();
    this.dataSource.paginator?.firstPage();
  }
}
