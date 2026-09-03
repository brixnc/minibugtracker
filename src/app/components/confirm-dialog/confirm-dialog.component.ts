import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/** Texte, mit denen der Bestätigungsdialog geöffnet wird. */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * Wiederverwendbarer Ja/Nein-Dialog. Wird vor allem vor dem Löschen
 * von Datensätzen eingesetzt.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="title">
      <mat-icon [class.destructive]="data.destructive">
        {{ data.destructive ? 'warning' : 'help_outline' }}
      </mat-icon>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="message">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close(false)">
        {{ data.cancelLabel ?? 'Abbrechen' }}
      </button>
      <button
        mat-flat-button
        type="button"
        [color]="data.destructive ? 'warn' : 'primary'"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmLabel ?? 'Bestätigen' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .destructive {
        color: #b3261e;
      }

      .message {
        margin: 0;
        max-width: 42ch;
        line-height: 1.55;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
