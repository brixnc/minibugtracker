/**
 * Mapping der JSON-Antwort von `GET /api/comments` auf eine Klasse
 * (Aufbau wie `data/game.ts` im Demoprojekt des ÜK).
 *
 * Validierungsregeln aus der JPA-Entity `Comment.java`:
 *  - content: @Size(min = 1, max = 1000)
 *  - author:  @Size(min = 2, max = 100)
 *  - bugId:   Fremdschlüssel auf den Bug (einfache Long-Referenz)
 *
 * Die Beziehung Bug -> Kommentare wird bewusst über die schlichte
 * Zahl `bugId` abgebildet und nicht über ein verschachteltes Bug-Objekt:
 * Das Backend liefert es so, und `GET /api/comments/bug/{bugId}` reicht
 * für die Detailseite völlig aus.
 */
export class Comment {
  /** Vergibt das Backend. Beim Anlegen noch nicht vorhanden - daher `!`. */
  public id!: number;
  public content = '';
  public author = '';
  public bugId!: number;
  public createdAt?: string;
}

/** Nutzlast für POST/PUT - `id` und `createdAt` vergibt das Backend. */
export type CommentPayload = Omit<Comment, 'id' | 'createdAt'>;

export const COMMENT_CONSTRAINTS = {
  contentMinLength: 1,
  contentMaxLength: 1000,
  authorMinLength: 2,
  authorMaxLength: 100,
} as const;
