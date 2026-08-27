/**
 * Produktions-Konfiguration.
 *
 * Die Werte stammen 1:1 aus dem Backend (`application.yaml`):
 *  - server.port                                        -> 9090
 *  - spring.security.oauth2...jwt.issuer-uri            -> http://localhost:8080/realms/minibugtracker
 */
export const environment = {
  production: true,
  /** Basis-URL des Spring-Boot-REST-Backends. */
  apiUrl: 'http://localhost:9090/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'minibugtracker',
    clientId: 'minibugtracker-frontend',
  },
};
