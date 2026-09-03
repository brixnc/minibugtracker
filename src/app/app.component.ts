import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';

import { AppAuthService } from './service/app.auth.service';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

/**
 * Wurzelkomponente: Rahmen aus Kopfzeile, Inhaltsbereich und Fusszeile.
 *
 * Der `<router-outlet>` ist der Platzhalter, in den der Angular Router die
 * jeweilige Seite hängt (Kapitel «Routing» des ÜK).
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
  private readonly auth = inject(AppAuthService);
  private readonly router = inject(Router);

  /** Titel der Anwendung, u. a. für den Test der Wurzelkomponente. */
  readonly title = 'MiniBugTracker';

  constructor() {
    this.restoreRouteAfterLogin();
  }

  /**
   * Bringt den Benutzer nach dem Login wieder dorthin, wo er hinwollte.
   *
   * Keycloak leitet immer auf die feste `redirectUri` aus `app.auth.ts`
   * zurück - also auf die Startseite. Guard und Anmelde-Baustein geben das
   * eigentliche Ziel deshalb als OAuth-`state` mit; hier wird es wieder
   * ausgepackt.
   *
   * Bewusst erst nach dem ersten `NavigationEnd`: Der Konstruktor der
   * Wurzelkomponente läuft, **bevor** der Router seine erste Navigation
   * ausführt. Ein `navigateByUrl` an dieser Stelle würde von der ersten
   * Navigation gleich wieder überholt.
   */
  private restoreRouteAfterLogin(): void {
    const target = this.auth.redirectTarget();

    // Nur weiterleiten, wenn tatsächlich ein Ziel gemerkt wurde, es eine
    // anwendungsinterne Adresse ist und der Login geklappt hat.
    if (!target || !target.startsWith('/') || !this.auth.isAuthenticated()) {
      return;
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        void this.router.navigateByUrl(target);
      });
  }
}
