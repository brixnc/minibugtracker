import { describe, it, expect } from 'vitest';
import { germanPaginatorIntl } from './paginator-intl';

/** Test der deutschen Beschriftungen für den Material-Paginator. */
describe('germanPaginatorIntl', () => {
  const intl = germanPaginatorIntl();

  it('übersetzt die festen Beschriftungen', () => {
    expect(intl.itemsPerPageLabel).toBe('Einträge pro Seite:');
    expect(intl.nextPageLabel).toBe('Nächste Seite');
    expect(intl.previousPageLabel).toBe('Vorherige Seite');
  });

  it('beschriftet den Bereich der ersten Seite', () => {
    expect(intl.getRangeLabel(0, 10, 25)).toBe('1 – 10 von 25');
  });

  it('beschriftet den Bereich der letzten, unvollständigen Seite', () => {
    expect(intl.getRangeLabel(2, 10, 25)).toBe('21 – 25 von 25');
  });

  it('kommt mit einer leeren Liste zurecht', () => {
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 von 0');
  });
});
