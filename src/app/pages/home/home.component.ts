import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppAuthService } from '../../service/app.auth.service';

/**
 * Oeffentliche Startseite fuer nicht angemeldete Besucher.
 *
 * Angemeldete Benutzer sehen diese Seite nicht: `appHomeRedirect` schickt
 * sie direkt auf das Dashboard. Die Seite wird trotzdem gebraucht, denn
 * Keycloak kehrt nach dem Abmelden hierher zurueck.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly auth = inject(AppAuthService);

  /** Die drei Kacheln unterhalb des Einstiegs. */
  protected readonly features = [
    {
      icon: 'bug_report',
      title: 'Bugs erfassen und verfolgen',
      text: 'Titel, Beschreibung, Status und Priorität - direkt gegen das REST-Backend.',
    },
    {
      icon: 'forum',
      title: 'Im Team kommentieren',
      text: 'Jeder Bug hat einen eigenen Kommentar-Verlauf mit Autor und Zeitstempel.',
    },
    {
      icon: 'shield',
      title: 'Rollen aus Keycloak',
      text: 'USER liest und meldet, ADMIN ändert und löscht - serverseitig geprüft.',
    },
  ];

  /**
   * Startet den Login bei Keycloak.
   *
   * `/dashboard` reist als OAuth-`state` mit; nach der Rückkehr wertet die
   * Wurzelkomponente ihn aus und navigiert dorthin. Ohne das landete man
   * immer auf der `redirectUri` aus `app.auth.ts`, also auf dieser Seite.
   */
  protected login(): void {
    this.auth.login('/dashboard');
  }
}
