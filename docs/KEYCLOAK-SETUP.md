# Keycloak einrichten

Das Backend erwartet laut `application.yaml` einen Issuer unter
`http://localhost:8080/realms/minibugtracker`. Damit das Frontend sich
anmelden kann, braucht es im selben Realm zusätzlich einen öffentlichen
Client.

---

## 1. Keycloak starten

```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0 start-dev
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
| Root URL                    | `http://localhost:4200`       |
| Home URL                    | `http://localhost:4200`       |
| Valid redirect URIs         | `http://localhost:4200/*`     |
| Valid post logout redirect URIs | `http://localhost:4200/*` |
| Web origins                 | `http://localhost:4200`       |

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
| `testuser` ruft `/projekte/neu` direkt auf | Weiterleitung auf die Seite „Kein Zugriff“           |
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
| CORS-Fehler von :9090 beim Produktionsbuild          | Die CORS-Freigabe im Backend fehlt, siehe `BACKEND-AENDERUNGEN.md`                      |
