/**
 * Entwicklungs-Konfiguration.
 *
 * `backendBaseUrl` ist hier bewusst relativ: Der Dev-Server von Angular
 * leitet `/api` per `proxy.conf.json` an http://localhost:9190 weiter.
 * Dadurch läuft die Entwicklung auch dann, wenn im Backend (noch) kein
 * CORS konfiguriert ist.
 *
 * Der `resourceServer` von angular-oauth2-oidc prüft mit `startsWith()`,
 * ob ein Request den Access-Token bekommt. Ein relativer Präfix `/api/`
 * funktioniert dort genauso wie eine absolute URL.
 */
export const environment = {
  production: false,
  backendBaseUrl: '/api/',
  frontendBaseUrl: 'http://localhost:4300',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'minibugtracker',
    clientId: 'minibugtracker-frontend',
  },
};
