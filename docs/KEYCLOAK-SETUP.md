# Keycloak einrichten

Das Backend erwartet laut `application.yaml` einen Issuer unter
`http://localhost:8080/realms/minibugtracker`. Damit das Frontend sich
anmelden kann, braucht es im selben Realm zusätzlich einen öffentlichen
Client.

Das Frontend spricht Keycloak über **`angular-oauth2-oidc`** an – die
Bibliothek, die die Wegleitung zur Projektarbeit empfiehlt. Sie spricht
reines OpenID Connect; für Keycloak sind deshalb keine besonderen
Einstellungen nötig, ein Standard-Client genügt.

Die Werte aus diesem Dokument stehen im Frontend an genau einer Stelle:
`src/environments/environment.ts` (Block `keycloak`). Daraus baut
`src/app/app.auth.ts` die `AuthConfig`.

---

## 0. Der kurze Weg: fertiger Realm per Docker

Wer `docker compose up -d` aus dem Wurzelverzeichnis des Pakets startet,
kann dieses Dokument überspringen: `docker-compose.yml` hängt den Ordner
`keycloak/` als Import-Verzeichnis ein und startet Keycloak mit
`--import-realm`. Realm, Client, die Rollen `USER` und `ADMIN` sowie die
beiden Testbenutzer sind dadurch sofort vorhanden.

Fertig ist der Import, wenn diese Adresse eine JSON-Antwort liefert:

```text
http://localhost:8080/realms/minibugtracker/.well-known/openid-configuration
```

Die folgenden Abschnitte beschreiben denselben Aufbau von Hand – nötig nur
ohne Docker oder wenn nachvollzogen werden soll, was der Import anlegt.

---

## 1. Keycloak lokal starten

Keycloak kann lokal ohne Docker gestartet werden, z. B. mit der
offiziellen Keycloak-Distribution:

```bash
bin/kc.sh start-dev
```

Windows:

```bash
bin\kc.bat start-dev
```

Adminkonsole: <http://localhost:8080/admin> (admin / admin)

---

## 2. Realm anlegen

1. Oben links auf das Realm-Auswahlfeld klicken → **Create realm**
2. **Realm name**: `minibugtracker`
3. **Create**

---

## 3. Client für das Frontend anlegen

Angular ist eine Single-Page-Anwendung und kann kein Client-Secret geheim
halten. Deshalb wird ein **öffentlicher** Client mit PKCE verwendet.

1. **Clients** → **Create client**
2. **Client type**: `OpenID Connect`
3. **Client ID**: `minibugtracker-frontend`
4. **Next** → **Client authentication**: `Off` (öffentlicher Client)
5. **Authentication flow**: `Standard flow` aktiviert, `Direct access grants`
   kann aktiviert bleiben
6. **Next** → folgende Adressen eintragen:

| Feld                        | Wert                          |
|-----------------------------|-------------------------------|
| Root URL                    | `http://localhost:4300`       |
| Home URL                    | `http://localhost:4300`       |
| Valid redirect URIs         | `http://localhost:4300/*`     |
| Valid post logout redirect URIs | `http://localhost:4300/*` |
| Web origins                 | `http://localhost:4300`       |

7. **Save**
8. Im Reiter **Advanced** unter *Advanced settings*:
   **Proof Key for Code Exchange Code Challenge Method** → `S256`

> Der Wert `Web origins` ist wichtig: Ohne ihn verweigert Keycloak selbst
> die Anfragen aus dem Browser.

---

## 4. Realm-Rollen anlegen

Das Backend liest die Rollen aus `realm_access.roles` und setzt ihnen in
`SecurityConfig` das Präfix `ROLE_` voran. Die Namen müssen deshalb exakt
so geschrieben sein:

1. **Realm roles** → **Create role** → Name `USER` → **Save**
2. **Realm roles** → **Create role** → Name `ADMIN` → **Save**

---

## 5. Testbenutzer anlegen

Für den Nachweis der Rollentrennung werden zwei Benutzer gebraucht.

### Benutzer mit der Rolle USER

1. **Users** → **Add user**
2. **Username**: `testuser` → **Create**
3. Reiter **Credentials** → **Set password** → Passwort setzen,
   **Temporary** auf `Off`
4. Reiter **Role mapping** → **Assign role** → Filter auf *realm roles*
   umstellen → `USER` auswählen → **Assign**

### Benutzer mit der Rolle ADMIN

Gleiches Vorgehen mit dem Benutzernamen `testadmin` und der Rolle `ADMIN`.
Zusätzlich kann `USER` vergeben werden, damit dieser Benutzer alle Listen
sieht.

---

## 6. Prüfen

| Prüfung                        | Erwartetes Ergebnis                                             |
|--------------------------------|------------------------------------------------------------------|
| Anmeldung als `testuser`       | Dashboard, Bugs und Projekte sind sichtbar                       |
| `testuser` in der Bug-Liste    | Es erscheinen **keine** Schaltflächen zum Bearbeiten oder Löschen |
| `testuser` ruft `/projekte/neu` direkt auf | Der Guard `appCanActivate` leitet auf `/noaccess` um – Seite „Kein Zugriff“ |
| Anmeldung als `testadmin`      | Bearbeiten, Löschen und „Neues Projekt“ sind sichtbar             |
| `testadmin` → Profil → „Adminzugriff prüfen“ | Das Backend antwortet mit „Hello admin testadmin“   |

---

## 7. Häufige Stolpersteine

| Symptom                                              | Ursache und Behebung                                                                 |
|------------------------------------------------------|---------------------------------------------------------------------------------------|
| Endlose Weiterleitung beim Login                     | `Valid redirect URIs` fehlt oder endet nicht auf `/*`                                 |
| Weiße Seite, in der Konsole ein CORS-Fehler von :8080 | `Web origins` im Client fehlt                                                          |
| Anmeldung klappt, jede API-Antwort ist `401`         | Realm im Frontend (`environment.ts`) und Issuer im Backend stimmen nicht überein        |
| Anmeldung klappt, jede API-Antwort ist `403`         | Dem Benutzer fehlt die Realm-Rolle `USER` oder `ADMIN`                                |
| CORS-Fehler von :9190 beim Produktionsbuild          | Die CORS-Freigabe im Backend fehlt, siehe `BACKEND-AENDERUNGEN.md`                      |
| `invalid_redirect_uri` direkt nach dem Klick auf *Anmelden* | `frontendBaseUrl` in `environment.ts` und `Valid redirect URIs` im Client passen nicht zusammen |
| Nach dem Login ist man sofort wieder abgemeldet      | Die Tokens liegen im `sessionStorage` – ein neuer Tab hat keine Sitzung. Das ist so gewollt. |
