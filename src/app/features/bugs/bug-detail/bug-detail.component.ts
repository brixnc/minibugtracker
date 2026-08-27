import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, switchMap } from 'rxjs';

import { BugService } from '../../../core/services/bug.service';
import { CommentService } from '../../../core/services/comment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Bug } from '../../../core/models/bug.model';
import { Comment } from '../../../core/models/comment.model';
import { AppRole } from '../../../core/models/user.model';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../../shared/components/priority-chip/priority-chip.component';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';
import { CommentListComponent } from '../../comments/comment-list/comment-list.component';
import { CommentFormComponent } from '../../comments/comment-form/comment-form.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Detailansicht eines Bugs samt Kommentarverlauf.
 *
 * Lädt `GET /api/bugs/{id}` und `GET /api/comments/bug/{bugId}` parallel
 * und bindet die beiden Kommentar-Komponenten ein.
 */
@Component({
  selector: 'app-bug-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    StatusChipComponent,
    PriorityChipComponent,
    HasRoleDirective,
    CommentListComponent,
    CommentFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bug-detail.component.html',
  styleUrl: './bug-detail.component.scss',
})
export class BugDetailComponent {
  private readonly bugService = inject(BugService);
  private readonly commentService = inject(CommentService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /** Route-Parameter `:id`. */
  readonly id = input.required<string>();

  protected readonly roles = AppRole;
  protected readonly loading = signal(true);
  protected readonly bug = signal<Bug | null>(null);
  protected readonly comments = signal<Comment[]>([]);

  constructor() {
    effect(() => {
      const id = Number(this.id());
      if (Number.isNaN(id)) {
        void this.router.navigate(['/bugs']);
        return;
      }
      this.load(id);
    });
  }

  /** Nimmt einen neu erfassten Kommentar in die Liste auf. */
  protected onCommentCreated(comment: Comment): void {
    this.comments.update((current) => [...current, comment]);
  }

  /** Entfernt einen gelöschten Kommentar aus der Liste. */
  protected onCommentDeleted(commentId: number): void {
    this.comments.update((current) => current.filter((comment) => comment.id !== commentId));
  }

  /** Löscht den Bug nach Rückfrage (nur ADMIN). */
  protected removeBug(): void {
    const bug = this.bug();
    if (!bug?.id) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Bug löschen?',
      message: `"${bug.title}" wird endgültig entfernt.`,
      confirmLabel: 'Löschen',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .pipe(switchMap((confirmed) => (confirmed && bug.id ? this.bugService.remove(bug.id) : [])))
      .subscribe(() => {
        this.notifications.success('Bug gelöscht.');
        void this.router.navigate(['/bugs']);
      });
  }

  private load(id: number): void {
    this.loading.set(true);
    forkJoin({
      bug: this.bugService.getById(id),
      comments: this.commentService.getByBugId(id),
    }).subscribe({
      next: ({ bug, comments }) => {
        this.bug.set(bug);
        this.comments.set(comments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        void this.router.navigate(['/bugs']);
      },
    });
  }
}
