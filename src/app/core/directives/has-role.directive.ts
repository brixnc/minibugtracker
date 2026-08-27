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

  /** Die Rollen, von denen mindestens eine vorhanden sein muss. */
  readonly appHasRole = input.required<string[]>();

  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.auth.hasAnyRole(this.appHasRole());

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
