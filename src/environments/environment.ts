/**
 * Produktions-Konfiguration.
 *
 * 
 *
 * Die Werte stammen 1:1 aus dem Backend (`application.yaml`):
 *  - server.port                              -> 9190
 *  - spring...jwt.issuer-uri                  -> http://localhost:8080/realms/minibugtracker
 *
 * Der Keycloak-Block steht hier und nicht im Code verteilt; an einer einzigen
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
  frontendBaseUrl: 'http://localhost:4300',

  keycloak: {
    url: 'http://localhost:8080',
    realm: 'minibugtracker',
    clientId: 'minibugtracker-frontend',
  },
};
