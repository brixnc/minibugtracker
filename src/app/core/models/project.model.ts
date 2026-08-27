/**
 * Mapping der JSON-Antwort von `GET /api/projects`.
 *
 * Validierungsregeln aus der JPA-Entity `Project.java`:
 *  - name:        @Size(min = 2, max = 100), fachlich zwingend
 *  - description: @Size(max = 300)
 *  - createdAt:   @CreationTimestamp (wird vom Backend gesetzt)
 */
export interface Project {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: string;
}

/** Nutzlast für POST/PUT - `id` und `createdAt` vergibt das Backend. */
export type ProjectPayload = Omit<Project, 'id' | 'createdAt'>;

export const PROJECT_CONSTRAINTS = {
  nameMinLength: 2,
  nameMaxLength: 100,
  descriptionMaxLength: 300,
} as const;
