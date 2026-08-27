import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

/**
 * Oeffentliche Startseite.
 *
 * Nicht angemeldete Besucher sehen hier den Einstieg in den Login-Vorgang,
 * angemeldete Benutzer den direkten Weg ins Dashboard.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

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

  /** Startet den Login und kehrt danach ins Dashboard zurück. */
  protected login(): void {
    void this.auth.login(`${window.location.origin}/dashboard`);
  }

  /** Wechselt für bereits angemeldete Benutzer ins Dashboard. */
  protected openDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
}
