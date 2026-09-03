/**
 * Produktions-Konfiguration.
 *
 * Die Namen `backendBaseUrl` und `frontendBaseUrl` sind bewusst genau die
 * aus dem Demoprojekt des ÜK (siehe Kapitel «Model und Service»). Dadurch
 * findet sich jede Person, die das Demoprojekt kennt, sofort zurecht.
 *
 * Die Werte stammen 1:1 aus dem Backend (`application.yaml`):
 *  - server.port                              -> 9190
 *  - spring...jwt.issuer-uri                  -> http://localhost:8080/realms/minibugtracker
 *
 * Der Keycloak-Block steht hier und nicht - wie im Demoprojekt - fest
 * verdrahtet in `app.auth.ts`. Grund: Die Projektabgabe verlangt, dass
 * Realm-, Client- und API-Angaben dokumentiert sind; an einer einzigen
 * Stelle lassen sie sich leichter nachschlagen und umstellen.
 */
export const environment = {
  production: true,

  /**
   * Basis-URL des Spring-Boot-REST-Backends.
   * Mit Schrägstrich am Ende, damit die Services wie im Demoprojekt
   * `environment.backendBaseUrl + BugService.backendUrl` zusammensetzen.
   */
  backendBaseUrl: 'http://localhost:9190/api/',

  /** Eigene Adresse - Keycloak leitet nach Login und Logout hierhin zurück. */
  frontendBaseUrl: 'http://localhost:4300',

  keycloak: {
    url: 'http://localhost:8080',
    realm: 'minibugtracker',
    clientId: 'minibugtracker-frontend',
  },
};
