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
 * Validierungsregeln aus der JPA-Entity `Bug.java`:
 *  - title:       @NotNull, @Size(min = 3,  max = 100)
 *  - description: @Size(max = 500)
 *  - status:      @NotNull, Enum
 *  - priority:    @NotNull, Enum
 *  - createdAt:   @CreationTimestamp (wird vom Backend gesetzt)
 */
export interface Bug {
  id?: number;
  title: string;
  description?: string | null;
  status: BugStatus;
  priority: BugPriority;
  createdAt?: string;
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
