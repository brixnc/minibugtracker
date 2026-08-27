import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

const STORAGE_KEY = 'minibugtracker.theme';
const DARK_CLASS = 'app-dark';

/** Verfügbare Darstellungsvarianten. */
export type AppTheme = 'light' | 'dark';

/**
 * Schaltet zwischen hellem und dunklem Material-Theme um und merkt sich
 * die Wahl im `localStorage`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<AppTheme>(this.readInitialTheme());

  /** Das aktuell aktive Theme. */
  readonly theme = this.current.asReadonly();

  /** `true`, wenn das dunkle Theme aktiv ist. */
  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    this.apply(this.current());
  }

  /** Wechselt zwischen hell und dunkel. */
  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  /** Setzt ein Theme explizit. */
  set(theme: AppTheme): void {
    this.current.set(theme);
    this.apply(theme);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Privater Modus o. Ä. - die Auswahl gilt dann nur für diese Sitzung.
    }
  }

  private apply(theme: AppTheme): void {
    this.document.body.classList.toggle(DARK_CLASS, theme === 'dark');
  }

  private readInitialTheme(): AppTheme {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      const prefersDark =
        this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
