import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';

/**
 * Wurzelkomponente: Rahmen aus Kopfzeile, Inhaltsbereich und Fusszeile.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Titel der Anwendung, u. a. für den Test der Wurzelkomponente. */
  readonly title = 'MiniBugTracker';
}
