import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';

import { AuthService } from '../services/auth.service';

/**
 * Strukturdirektive, die Teile einer Seite rollenabhängig ein- oder ausblendet.
 *
 * ```html
 * <button *appHasRole="['ADMIN']" mat-flat-button>Löschen</button>
 * ```
 *
 * Reagiert über Signale automatisch darauf, wenn sich der angemeldete
 * Benutzer ändert (Login / Logout).
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  /**
   * Die Rollen, von denen mindestens eine vorhanden sein muss.
   *
   * Bewusst nicht `input.required`: Der Effect unten laeuft bereits beim
   * ersten Durchlauf der Aenderungserkennung, und zu diesem Zeitpunkt hat
   * Angular den Wert noch nicht gesetzt. Ein `required`-Input wirft dann
   * NG0950. Solange kein Wert vorliegt, wird nichts angezeigt - im Zweifel
   * also verbergen statt preisgeben.
   */
  readonly appHasRole = input<string[] | undefined>(undefined);

  private rendered = false;

  constructor() {
    effect(() => {
      const required = this.appHasRole();
      const allowed = required !== undefined && this.auth.hasAnyRole(required);

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
