import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Deutsche Beschriftungen für den Material-Paginator.
 *
 * Angular Material liefert die Bedienelemente ausschliesslich auf Englisch
 * aus. Diese Klasse ersetzt die Texte, damit die Oberfläche durchgehend
 * deutsch ist.
 */
export function germanPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Einträge pro Seite:';
  intl.nextPageLabel = 'Nächste Seite';
  intl.previousPageLabel = 'Vorherige Seite';
  intl.firstPageLabel = 'Erste Seite';
  intl.lastPageLabel = 'Letzte Seite';

  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 von ${length}`;
    }

    const total = Math.max(length, 0);
    const start = page * pageSize;
    const end = start < total ? Math.min(start + pageSize, total) : start + pageSize;

    return `${start + 1} – ${end} von ${total}`;
  };

  return intl;
}
