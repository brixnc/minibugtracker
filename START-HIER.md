# MiniBugTracker – Gesamtpaket

ÜK Modul 294 · *Frontend einer interaktiven Webapplikation realisieren*

Dieses Paket enthält alles, was zum Betrieb nötig ist. Wenn Docker läuft,
sind es drei Befehle bis zur laufenden Anwendung.

---

## 1. Was liegt hier drin

| Ordner / Datei | Inhalt |
|----------------|--------|
| `minibugtracker-frontend/` | Angular-19-Anwendung (das Prüfungsprojekt) |
| `minibugtracker-backend/` | Spring-Boot-REST-Backend, ergänzt um CORS |
| `keycloak/minibugtracker-realm.json` | Fertiger Keycloak-Realm: Client, Rollen, zwei Testbenutzer |
| `docker-compose.yml` | Startet PostgreSQL und Keycloak |
| `START-HIER.md` | Diese Datei |

Die ausführliche Dokumentation steht in
`minibugtracker-frontend/README.md` sowie in dessen `docs/`-Ordner.

---

## 2. Voraussetzungen

| Werkzeug | Version | Prüfen mit |
|----------|---------|-----------|
| Java (JDK) | 25 | `java -version` |
| Node.js | ab 18.19 | `node -v` |
| npm | ab 9 | `npm -v` |
| Docker Desktop | aktuell | `docker --version` |

Ohne Docker geht es auch – siehe Abschnitt 7.

---

## 3. Start in drei Schritten

### Schritt 1 – Datenbank und Keycloak starten

```bash
docker compose up -d
```

Das startet:

* **PostgreSQL** auf `localhost:5432` mit der Datenbank `bugtracker_db`
* **Keycloak** auf `localhost:8080` mit dem fertig eingerichteten Realm
  `minibugtracker`

Keycloak braucht beim ersten Start etwa 30–60 Sekunden. Fertig ist es, wenn
diese Adresse im Browser eine JSON-Antwort liefert:

```text
http://localhost:8080/realms/minibugtracker/.well-known/openid-configuration
```

### Schritt 2 – Backend starten

```bash
cd minibugtracker-backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

Falls `JAVA_HOME` noch auf einen alten JDK-Ordner zeigt, verwendet Windows
stattdessen den installierten JDK 25 für diesen Terminal:

```bash
# Git Bash
export JAVA_HOME="/c/Program Files/Microsoft/jdk-25.0.4.101-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"
cd minibugtracker-backend
./mvnw spring-boot:run
```

Oder in PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-25.0.4.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Set-Location minibugtracker-backend
.\mvnw.cmd spring-boot:run
```

Läuft danach auf `http://localhost:9190`.
Prüfen: `http://localhost:9190/swagger-ui.html` zeigt die API-Dokumentation.

### Schritt 3 – Frontend starten

```bash
cd minibugtracker-frontend
npm install
npm start
```

Läuft danach auf **<http://localhost:4300>**.

---

## 4. Anmelden

| Benutzer | Passwort | Rollen | Was er darf |
|----------|----------|--------|-------------|
| `testadmin` | `admin123` | ADMIN, USER | alles: anlegen, ändern, löschen |
| `testuser` | `user123` | USER | lesen, Bugs und Kommentare erfassen |

Keycloak-Adminkonsole: <http://localhost:8080/admin> · `admin` / `admin`

> Diese Zugangsdaten sind bewusst simpel, weil es eine Übungsumgebung ist.
> Für einen echten Betrieb gehören sie ersetzt.

Nach dem Anmelden landet man direkt im Dashboard: Die Startseite `/` leitet
angemeldete Benutzer dorthin weiter. Sie bleibt trotzdem bestehen, denn
Keycloak kehrt nach dem Abmelden auf `/` zurück.

---

## 5. Prüfen, ob wirklich alles läuft

Diese Runde eignet sich auch als Vorführung im ÜK:

1. **Angemeldet als `testadmin`**
   - Nach dem Login erscheint sofort das Dashboard, nicht die Startseite
   - Dashboard zeigt Kennzahlen und die zuletzt gemeldeten Bugs
   - Bugs → *Bug melden* → Titel eingeben → speichern → landet auf der Detailseite
   - Auf der Detailseite einen Kommentar schreiben → erscheint sofort
   - In der Liste auf *Löschen* → Rückfrage kommt → bestätigen → Eintrag weg
   - *Neues Projekt* ist in der Kopfzeile sichtbar
2. **Abmelden, anmelden als `testuser`**
   - Nach dem Abmelden erscheint wieder die öffentliche Startseite
   - In der Bug-Liste fehlen Bearbeiten und Löschen
   - *Neues Projekt* fehlt in der Kopfzeile
   - `http://localhost:4300/projekte/neu` direkt aufrufen → Seite „Kein Zugriff"
3. **Validierung zeigen**
   - Bug melden mit einem Titel aus zwei Zeichen → Fehlermeldung unter dem Feld
4. **Design**
   - Mond-Symbol in der Kopfzeile → dunkles Design, überlebt einen Seitenwechsel

---

## 6. Prüfbefehle für die Bewertung

```bash
# Frontend
cd minibugtracker-frontend
npm run lint       # -> All files pass linting
npm run build      # -> ohne Warnung
npm test           # -> 54 Tests, alle grün
                   #    Vitest laeuft in jsdom, also ohne Browser

# Backend
cd ../minibugtracker-backend
./mvnw test        # -> 26 Tests, BUILD SUCCESS
```

---

## 7. Ohne Docker

**PostgreSQL** lokal installieren und anlegen:

```sql
CREATE DATABASE bugtracker_db;
-- Benutzer postgres mit Passwort Colloccollo123#
-- (oder application.yaml des Backends auf die eigenen Werte anpassen)
```

**Keycloak** herunterladen und starten:

```bash
bin/kc.sh start-dev --import-realm
```

Dabei `keycloak/minibugtracker-realm.json` vorher nach
`data/import/` kopieren. Alternativ den Realm von Hand einrichten –
die Schritte stehen in
`minibugtracker-frontend/docs/KEYCLOAK-SETUP.md`.

---

## 8. Wenn etwas klemmt

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| Weisse Seite, Konsole meldet CORS-Fehler von `:8080` | Web-Origins im Keycloak-Client fehlen | Realm neu importieren: `docker compose down -v && docker compose up -d` |
| Endlose Weiterleitung beim Login | Redirect-URI passt nicht | Muss `http://localhost:4300/*` sein (mit Stern) |
| Login bricht mit `invalid_redirect_uri` ab | Frontend laeuft auf einem anderen Port | `frontendBaseUrl` in `environment.ts` und die Redirect-URI in Keycloak angleichen |
| Anmeldung klappt, jede API-Antwort ist `401` | Realm im Frontend und Issuer im Backend passen nicht zusammen | `environment.ts` und `application.yaml` vergleichen |
| Anmeldung klappt, jede API-Antwort ist `403` | Benutzer hat keine Realm-Rolle | In Keycloak unter *Users → Role mapping* `USER` oder `ADMIN` zuweisen |
| „Das Backend ist nicht erreichbar" | Backend läuft nicht | Schritt 2 wiederholen, Port 9190 prüfen |
| Backend startet nicht, `Connection refused :5432` | PostgreSQL läuft nicht | `docker compose ps` prüfen |
| `./mvnw: Permission denied` | Ausführungsrecht fehlt | `chmod +x mvnw` |
| Port 8080 schon belegt | anderer Dienst läuft dort | In `docker-compose.yml` auf z. B. `8081:8080` ändern **und** die Adresse in `environment.ts` sowie `application.yaml` mitziehen |
| Anwendung startet, aber ohne Anmeldung | Keycloak war beim Start nicht erreichbar | Keycloak hochfahren lassen, dann Seite neu laden |

---

## 9. Ports auf einen Blick

| Dienst | Port | Wird gebraucht von |
|--------|------|--------------------|
| Frontend | 4300 | Browser |
| Backend | 9190 | Frontend |
| Keycloak | 8080 | Frontend und Backend |
| PostgreSQL | 5432 | Backend |

Ändert man einen Port, muss er an **allen** Stellen mitgezogen werden:
`docker-compose.yml`, `keycloak/minibugtracker-realm.json`,
`minibugtracker-frontend/src/environments/*.ts`,
`minibugtracker-frontend/proxy.conf.json` und
`minibugtracker-backend/src/main/resources/application.yaml`.
