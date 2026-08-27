/**
 * Mapping der JSON-Antwort von `GET /api/comments`.
 *
 * Validierungsregeln aus der JPA-Entity `Comment.java`:
 *  - content: @Size(min = 1, max = 1000)
 *  - author:  @Size(min = 2, max = 100)
 *  - bugId:   Fremdschlüssel auf den Bug (einfache Long-Referenz)
 */
export interface Comment {
  id?: number;
  content: string;
  author: string;
  bugId: number;
  createdAt?: string;
}

/** Nutzlast für POST/PUT - `id` und `createdAt` vergibt das Backend. */
export type CommentPayload = Omit<Comment, 'id' | 'createdAt'>;

export const COMMENT_CONSTRAINTS = {
  contentMinLength: 1,
  contentMaxLength: 1000,
  authorMinLength: 2,
  authorMaxLength: 100,
} as const;
