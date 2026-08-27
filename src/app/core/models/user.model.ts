/**
 * Mapping der JSON-Antwort von `GET /api/users/me`.
 * Die Werte stammen aus den Claims des Keycloak-JWT.
 */
export interface CurrentUser {
  username: string;
  email: string;
  subject: string;
  roles: string[];
}

/**
 * Realm-Rollen, die das Backend in `SecurityConfig` auf `ROLE_*` abbildet
 * und in den `@PreAuthorize`-Annotationen auswertet.
 */
export enum AppRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
