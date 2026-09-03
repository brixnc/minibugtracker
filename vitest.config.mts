/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

/**
 * Konfiguration des Testlaufs.
 *
 * Der ÜK schreibt Vitest vor («Verwenden Sie Vitest mit Angular Testing»).
 * Ein reines `npm install vitest` genügt für Angular allerdings nicht:
 * Vitest kann von sich aus weder Angular-Templates noch Decorators
 * übersetzen. Das übernimmt `@analogjs/vite-plugin-angular` - das ist der
 * übliche Weg, Vitest in einem Angular-CLI-Projekt zu betreiben.
 *
 * `jsdom` ersetzt den Browser. Dadurch laufen die Tests ohne Chrome und
 * ohne Bildschirm, also auch in einer Konsole ohne grafische Oberfläche -
 * das war mit Karma nur über einen Headless-Browser zu haben.
 *
 * Die Endung ist bewusst `.mts` und nicht `.ts`: `package.json` enthält
 * kein `"type": "module"`, deshalb würde Vite diese Datei sonst als
 * CommonJS laden - und `@analogjs/vite-plugin-angular` ist ein reines
 * ES-Modul.
 */
export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    // `describe`, `it` und `expect` ohne Import verfügbar - so bleiben die
    // Testdateien nah an dem, was aus Jasmine/Karma bekannt ist.
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],

    server: {
      deps: {
        /**
         * Alle Angular-Pakete durch Vite laufen lassen statt sie an Node
         * durchzureichen.
         *
         * Ohne diese Zeile behandelt Vite `@angular/platform-browser-dynamic`
         * als externes Node-Modul, `.../testing` dagegen nicht. Dann existiert
         * `@angular/core` zweimal: Die Plattform wird in der einen Kopie
         * angelegt, gesucht wird sie in der anderen - der Testlauf bricht mit
         * «NG0401: No platform exists!» ab, noch bevor ein einziger Test läuft.
         *
         * Der Ausdruck ist bewusst nicht mit `^` verankert: Geprüft wird der
         * aufgelöste Dateipfad (…/node_modules/@angular/…), nicht der
         * Paketname.
         */
        inline: [/@angular\//],
      },
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
