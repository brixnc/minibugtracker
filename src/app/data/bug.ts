/**
 * Status eines Bugs.
 * Entspricht dem Java-Enum `ch.brian.kihara.minibugtracker.bug.BugStatus`.
 */
export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

/**
 * Priorität eines Bugs.
 * Entspricht dem Java-Enum `ch.brian.kihara.minibugtracker.bug.BugPriority`.
 */
export enum BugPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Mapping der JSON-Antwort von `GET /api/bugs` auf eine TypeScript-Klasse.
 *
 * Bewusst eine `class` und kein `interface` - so hält es auch das
 * Demoprojekt des ÜK (`data/game.ts`). Zwei Gründe sprechen dafür:
 *  - `new Bug()` liefert dank der Vorgabewerte ein vollständig gefülltes
 *    Objekt, das sich sofort an ein Formular binden lässt.
 *  - Der Bewertungspunkt heisst «Mapping JSON auf Klassen»; eine Klasse
 *    ist im erzeugten JavaScript tatsächlich vorhanden, ein Interface
 *    verschwindet beim Übersetzen spurlos.
 *
 * `HttpClient.get<Bug[]>()` erzeugt keine echten Instanzen, sondern typisiert
 * die geparsten JSON-Objekte. Das genügt hier, weil die Klasse keine
 * Methoden hat - genau wie im Demoprojekt.
 *
 * Validierungsregeln aus der JPA-Entity `Bug.java`:
 *  - title:       @NotNull, @Size(min = 3,  max = 100)
 *  - description: @Size(max = 500)
 *  - status:      @NotNull, Enum
 *  - priority:    @NotNull, Enum
 *  - createdAt:   @CreationTimestamp (wird vom Backend gesetzt)
 */
export class Bug {
  /** Vergibt das Backend. Beim Anlegen noch nicht vorhanden - daher `!`. */
  public id!: number;
  public title = '';
  public description: string | null = null;
  public status: BugStatus = BugStatus.OPEN;
  public priority: BugPriority = BugPriority.MEDIUM;
  public createdAt?: string;
}

/** Nutzlast für POST/PUT - `id` und `createdAt` vergibt das Backend. */
export type BugPayload = Omit<Bug, 'id' | 'createdAt'>;

/** Feldlängen aus der Backend-Entity, damit Frontend und Backend nie auseinanderlaufen. */
export const BUG_CONSTRAINTS = {
  titleMinLength: 3,
  titleMaxLength: 100,
  descriptionMaxLength: 500,
} as const;

export const BUG_STATUS_OPTIONS: readonly BugStatus[] = [
  BugStatus.OPEN,
  BugStatus.IN_PROGRESS,
  BugStatus.CLOSED,
];

export const BUG_PRIORITY_OPTIONS: readonly BugPriority[] = [
  BugPriority.HIGH,
  BugPriority.MEDIUM,
  BugPriority.LOW,
];

/** Deutsche Beschriftungen für die Oberfläche. */
export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  [BugStatus.OPEN]: 'Offen',
  [BugStatus.IN_PROGRESS]: 'In Arbeit',
  [BugStatus.CLOSED]: 'Geschlossen',
};

export const BUG_PRIORITY_LABELS: Record<BugPriority, string> = {
  [BugPriority.HIGH]: 'Hoch',
  [BugPriority.MEDIUM]: 'Mittel',
  [BugPriority.LOW]: 'Tief',
};
