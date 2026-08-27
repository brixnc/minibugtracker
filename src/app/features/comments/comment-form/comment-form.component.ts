import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { COMMENT_CONSTRAINTS, Comment } from '../../../core/models/comment.model';

/**
 * Eingabefeld für einen neuen Kommentar zu einem Bug.
 *
 * Der Autor wird mit dem Benutzernamen aus dem Keycloak-Token vorbelegt,
 * bleibt aber änderbar - das Backend verlangt in `Comment.java` lediglich
 * 2 bis 100 Zeichen.
 */
@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
})
export class CommentFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly commentService = inject(CommentService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  /** Der Bug, zu dem der Kommentar gehört. */
  readonly bugId = input.required<number>();

  /** Wird nach erfolgreichem Speichern mit dem neuen Kommentar ausgelöst. */
  readonly created = output<Comment>();

  protected readonly constraints = COMMENT_CONSTRAINTS;
  protected readonly saving = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    author: [
      '',
      [
        Validators.required,
        Validators.minLength(COMMENT_CONSTRAINTS.authorMinLength),
        Validators.maxLength(COMMENT_CONSTRAINTS.authorMaxLength),
      ],
    ],
    content: [
      '',
      [
        Validators.required,
        Validators.minLength(COMMENT_CONSTRAINTS.contentMinLength),
        Validators.maxLength(COMMENT_CONSTRAINTS.contentMaxLength),
      ],
    ],
  });

  constructor() {
    // Autor aus dem angemeldeten Benutzer vorbelegen.
    effect(() => {
      const username = this.auth.user()?.username;
      if (username && this.form.controls.author.pristine) {
        this.form.controls.author.setValue(username);
      }
    });
  }

  /** Aktuelle Länge des Kommentartextes. */
  protected get contentLength(): number {
    return this.form.controls.content.value.length;
  }

  /** Sendet den Kommentar an `POST /api/comments`. */
  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);

    this.commentService
      .create({
        author: raw.author.trim(),
        content: raw.content.trim(),
        bugId: this.bugId(),
      })
      .subscribe({
        next: (comment) => {
          this.saving.set(false);
          this.form.controls.content.reset('');
          this.notifications.success('Kommentar gespeichert.');
          this.created.emit(comment);
        },
        error: () => this.saving.set(false),
      });
  }
}
