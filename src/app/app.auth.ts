import { AuthConfig } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';

/**
 * OAuth-2-/OpenID-Connect-Konfiguration für Keycloak.
 *
 * Entspricht der Datei `app.auth.ts` aus dem Demoprojekt des ÜK. Dort steht
 * der Issuer fest verdrahtet drin; hier wird er aus `environment.ts`
 * zusammengesetzt, damit Realm und Client nur an einer Stelle gepflegt
 * werden müssen (Entwicklung und Produktion teilen sich diese Datei).
 *
 * Ergibt konkret:
 *   issuer -> http://localhost:8080/realms/minibugtracker
 *
 * Dieselbe Adresse muss im Backend unter
 * `spring.security.oauth2.resourceserver.jwt.issuer-uri` stehen - sonst
 * beantwortet das Backend jeden Request mit HTTP 401.
 */
export const authConfig: AuthConfig = {
  /** Der Realm in Keycloak. Muss mit dem Issuer im Backend übereinstimmen. */
  issuer: `${environment.keycloak.url}/realms/${environment.keycloak.realm}`,

  /** Der öffentliche Client, der in Keycloak angelegt ist. */
  clientId: environment.keycloak.clientId,

  /**
   * Rücksprungadresse nach dem Login. In Keycloak muss unter dem Client
   * `http://localhost:4300/*` als «Valid redirect URI» eingetragen sein -
   * mit Stern, sonst endet der Login in einer Weiterleitungsschleife.
   */
  redirectUri: `${environment.frontendBaseUrl}/`,
  postLogoutRedirectUri: `${environment.frontendBaseUrl}/`,

  /**
   * Authorization Code Flow mit PKCE. Der frühere Implicit Flow gilt als
   * unsicher, weil das Token im Browserverlauf landet; Keycloak schaltet
   * ihn bei neuen Clients standardmässig ab.
   */
  responseType: 'code',

  /**
   * `openid` ist für OIDC zwingend, `profile` liefert den Benutzernamen,
   * `email` die Adresse für die Profilseite.
   */
  scope: 'openid profile email',

  /**
   * Die Übungsumgebung läuft auf http://localhost. Ohne diese Freigabe
   * verweigert die Bibliothek den Start. Im echten Betrieb gehört der Wert
   * auf `true` und Keycloak hinter HTTPS.
   */
  requireHttps: false,

  /** Ausführliches Protokoll in der Browserkonsole - nur beim Entwickeln. */
  showDebugInformation: !environment.production,

  /**
   * Keycloak veröffentlicht sein Discovery-Dokument unter
   * `/realms/<realm>/.well-known/openid-configuration`. Die strenge Prüfung
   * erwartet, dass alle darin genannten URLs mit dem Issuer beginnen; das
   * trifft bei Keycloak nicht auf jeden Endpunkt zu.
   */
  strictDiscoveryDocumentValidation: false,

  /** Entfernt Code und State nach dem Login aus der Adresszeile. */
  clearHashAfterLogin: true,
};
