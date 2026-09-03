import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { AppAuthService } from '../service/app.auth.service';

/**
 * Strukturdirektive, die Teile einer Seite rollenabhängig ein- oder
 * ausblendet. Name und Dateiname wie im Demoprojekt des ÜK
 * (`directives/app-is-in-role.dir.ts`).
 *
 * ```html
 * <button *appIsInRoles="[roles.Admin]" mat-flat-button>Löschen</button>
 * ```
 *
 * Reagiert über Signale automatisch darauf, wenn sich der angemeldete
 * Benutzer ändert (Login / Logout) - ohne erneutes Laden der Seite.
 *
 * Wichtig: Das ist reine Bequemlichkeit für die Oberfläche. Wer die
 * Schaltfläche nicht sieht, könnte den Endpunkt trotzdem direkt aufrufen -
 * deshalb prüft das Backend jede schreibende Aktion nochmals selbst.
 */
@Directive({
  selector: '[appIsInRoles]',
  standalone: true,
})
export class AppIsInRolesDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AppAuthService);

  /**
   * Die Rollen, von denen mindestens eine vorhanden sein muss.
   *
   * Bewusst nicht `input.required`: Der Effect unten läuft bereits beim
   * ersten Durchlauf der Änderungserkennung, und zu diesem Zeitpunkt hat
   * Angular den Wert noch nicht gesetzt. Ein `required`-Input wirft dann
   * NG0950. Solange kein Wert vorliegt, wird nichts angezeigt - im Zweifel
   * also verbergen statt preisgeben.
   */
  readonly appIsInRoles = input<string[] | undefined>(undefined);

  private rendered = false;

  constructor() {
    effect(() => {
      const required = this.appIsInRoles();
      const allowed = required !== undefined && this.auth.isInRoles(required);

      if (allowed && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
