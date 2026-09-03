/**
 * Mapping der JSON-Antwort von `GET /api/projects` auf eine Klasse
 * (Aufbau wie `data/game.ts` im Demoprojekt des ÜK).
 *
 * Validierungsregeln aus der JPA-Entity `Project.java`:
 *  - name:        @Size(min = 2, max = 100), fachlich zwingend
 *  - description: @Size(max = 300)
 *  - createdAt:   @CreationTimestamp (wird vom Backend gesetzt)
 */
export class Project {
  /** Vergibt das Backend. Beim Anlegen noch nicht vorhanden - daher `!`. */
  public id!: number;
  public name = '';
  public description: string | null = null;
  public createdAt?: string;
}

/** Nutzlast für POST/PUT - `id` und `createdAt` vergibt das Backend. */
export type ProjectPayload = Omit<Project, 'id' | 'createdAt'>;

export const PROJECT_CONSTRAINTS = {
  nameMinLength: 2,
  nameMaxLength: 100,
  descriptionMaxLength: 300,
} as const;
