/**
 * Realm-Rollen aus Keycloak.
 *
 * Aufbau wie `app.roles.ts` im Demoprojekt des ÜK: eine einzige Datei im
 * Wurzelverzeichnis von `app`, damit Guards, Direktiven und Templates
 * dieselbe Quelle verwenden und sich Tippfehler in Zeichenketten gar nicht
 * erst einschleichen können.
 *
 * Die Werte müssen exakt den Realm-Rollen in Keycloak entsprechen. Das
 * Backend liest sie in `SecurityConfig.jwtAuthConverter()` aus dem Claim
 * `realm_access.roles` und stellt ihnen `ROLE_` voran, damit
 * `@PreAuthorize("hasRole('ADMIN')")` greift.
 */
export enum AppRoles {
  /** Darf lesen sowie Bugs und Kommentare erfassen. */
  User = 'USER',

  /** Darf zusätzlich ändern und löschen sowie Projekte anlegen. */
  Admin = 'ADMIN',
}
