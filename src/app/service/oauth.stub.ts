/**
 * Testdouble für den `OAuthService` von angular-oauth2-oidc.
 *
 * NUR FÜR TESTS - diese Datei wird von `main.ts` aus nirgends erreicht und
 * landet deshalb auch nicht im Produktions-Bundle.
 *
 * Sie liegt bewusst neben dem echten Service: Fast jeder Test der
 * Anwendung braucht einen angemeldeten Benutzer mit bestimmten Rollen.
 * Ohne diese gemeinsame Attrappe stünde in jeder Spec-Datei dieselbe
 * Nachbildung.
 *
 * Nachgebildet ist nur, was `AppAuthService` tatsächlich aufruft. Alles
 * andere fehlt absichtlich - dann fällt beim Erweitern sofort auf, wenn
 * eine neue Abhängigkeit hinzukommt.
 */
export class OAuthServiceStub {
  /** Der aktuell «ausgestellte» Access-Token. */
  private accessToken = '';

  /** Der OAuth-`state`, den `initLoginFlow()` mitgibt. */
  state?: string;

  /** `true`, sobald `logOut()` aufgerufen wurde. */
  loggedOut = false;

  /** Meldet einen Benutzer an - `token` kommt aus `fakeAccessToken()`. */
  signIn(token: string): void {
    this.accessToken = token;
    this.loggedOut = false;
  }

  /** Meldet den Benutzer wieder ab. */
  signOut(): void {
    this.accessToken = '';
  }

  // --- ab hier: die Schnittstelle des echten OAuthService ---------------

  // Die AuthConfig wird bewusst nicht entgegengenommen: Im Test ist
  // nichts zu konfigurieren, und ein ungenutzter Parameter wäre ein
  // Lint-Fehler. Zusätzliche Argumente ignoriert JavaScript ohnehin.
  configure(): void {
    // absichtlich leer
  }

  loadDiscoveryDocumentAndTryLogin(): Promise<boolean> {
    return Promise.resolve(this.hasValidAccessToken());
  }

  setupAutomaticSilentRefresh(): void {
    // Kein Timer im Test - der würde den Testlauf offen halten.
  }

  hasValidAccessToken(): boolean {
    return this.accessToken.length > 0;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  initLoginFlow(additionalState?: string): void {
    this.state = additionalState;
  }

  logOut(): void {
    this.loggedOut = true;
    this.accessToken = '';
  }
}

/**
 * Baut einen unsignierten JWT mit den angegebenen Realm-Rollen.
 *
 * Ein JWT besteht aus drei Base64-Teilen (Header, Payload, Signatur),
 * getrennt durch Punkte. `JwtHelperService.decodeToken()` prüft die
 * Signatur nicht - für einen Unit-Test genügt daher ein Platzhalter.
 * Die Struktur entspricht dem, was Keycloak ausstellt: Realm-Rollen unter
 * `realm_access.roles`.
 *
 * Nur ASCII verwenden - `btoa()` kann mit Umlauten nicht umgehen.
 */
export function fakeAccessToken(username: string, roles: string[]): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      preferred_username: username,
      email: `${username}@example.ch`,
      sub: `sub-${username}`,
      realm_access: { roles },
    }),
  );
  return `${header}.${payload}.signature`;
}
