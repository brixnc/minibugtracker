/**
 * Mapping der JSON-Antwort von `GET /api/users/me` auf eine Klasse.
 * Die Werte stammen aus den Claims des Keycloak-JWT.
 *
 * Die Realm-Rollen selbst stehen nicht hier, sondern als Aufzählung in
 * `app.roles.ts` - so hält es auch das Demoprojekt des ÜK. Guards,
 * Direktive und Templates greifen dadurch auf dieselbe Quelle zu, ohne
 * ein Datenmodell importieren zu müssen.
 */
export class CurrentUser {
  public username = '';
  public email = '';
  /** Die `sub`-Claim des Tokens: die unveränderliche Benutzer-ID in Keycloak. */
  public subject = '';
  public roles: string[] = [];
}
