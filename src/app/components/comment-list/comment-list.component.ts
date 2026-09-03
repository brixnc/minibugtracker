import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap } from 'rxjs';

import { CommentService } from '../../service/comment.service';
import { NotificationService } from '../../service/notification.service';
import { Comment } from '../../data/comment';
import { AppRoles } from '../../app.roles';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';

/**
 * Zeigt den Kommentarverlauf eines Bugs.
 *
 * Das Löschen einzelner Kommentare ist über `*appIsInRoles` nur für ADMIN
 * sichtbar, weil `DELETE /api/comments/{id}` serverseitig ADMIN verlangt.
 */
@Component({
    selector: 'app-comment-list',
    imports: [
        DatePipe,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        AppIsInRolesDirective,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './comment-list.component.html',
    styleUrl: './comment-list.component.scss'
})
export class CommentListComponent {
  private readonly commentService = inject(CommentService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  /** Die anzuzeigenden Kommentare (bereits vom Elternteil geladen). */
  readonly comments = input.required<Comment[]>();

  /** Wird ausgelöst, wenn ein Kommentar gelöscht wurde. */
  readonly deleted = output<number>();

  protected readonly roles = AppRoles;

  /** Initialen des Autors für den Avatar. */
  protected initials(author: string): string {
    return author.slice(0, 2).toUpperCase();
  }

  /** Löscht einen Kommentar nach Rückfrage (nur ADMIN). */
  protected remove(comment: Comment): void {
    const data: ConfirmDialogData = {
      title: 'Kommentar löschen?',
      message: `Der Kommentar von ${comment.author} wird endgültig entfernt.`,
      confirmLabel: 'Löschen',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.commentService.delete(comment.id) : [],
        ),
      )
      .subscribe(() => {
        this.notifications.success('Kommentar gelöscht.');
        this.deleted.emit(comment.id);
      });
  }
}
