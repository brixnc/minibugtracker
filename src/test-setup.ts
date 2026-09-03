/**
 * Wird vor jeder Testdatei ausgeführt (siehe `vitest.config.mts`).
 *
 * `setup-zone` lädt Zone.js samt Testerweiterung. Angular braucht das für
 * `fakeAsync`, `waitForAsync` und die automatische Änderungserkennung.
 *
 * `initTestEnvironment` richtet die TestBed-Umgebung einmalig ein - unter
 * Karma erledigte das bisher der Builder selbst.
 */
import '@analogjs/vitest-angular/setup-zone';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

/**
 * Angular Material prüft beim Aufbau seiner Komponenten, ob ein Theme
 * geladen ist, und warnt sonst auf der Konsole. In jsdom gibt es keine
 * echten Stylesheets; diese eine Regel genügt für die Prüfung und hält die
 * Testausgabe frei von Warnungen, die nichts mit den Tests zu tun haben.
 */
const themeMarker = document.createElement('style');
themeMarker.textContent = '.mat-theme-loaded-marker { display: none; }';
document.head.appendChild(themeMarker);

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  // Baut jede Testkomponente nach dem Test wieder ab. Ohne das behalten
  // Komponenten ihre Effects und Subscriptions und beeinflussen den
  // naechsten Test.
  teardown: { destroyAfterEach: true },
});
