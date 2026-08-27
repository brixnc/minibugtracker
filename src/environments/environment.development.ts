/**
 * Entwicklungs-Konfiguration.
 *
 * `apiUrl` ist hier bewusst relativ: Der Dev-Server von Angular leitet
 * `/api` per `proxy.conf.json` an http://localhost:9090 weiter. Dadurch
 * läuft die Entwicklung auch dann, wenn im Backend (noch) kein CORS
 * konfiguriert ist.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'minibugtracker',
    clientId: 'minibugtracker-frontend',
  },
};
