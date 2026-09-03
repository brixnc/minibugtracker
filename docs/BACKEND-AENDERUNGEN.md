# Änderungen am Backend

Am Repository [brixnc/minibugtracker](https://github.com/brixnc/minibugtracker)
wurden zwei Dinge gemacht. Fachlogik, Datenmodell und Berechtigungen bleiben
in beiden Fällen unverändert.

| Commit | Inhalt |
|--------|--------|
| 1 | **CORS-Freigabe** für das Frontend – ohne sie funktioniert der Produktionsbuild nicht |
| 2 | **Reparatur der Testsuite** – sie liess sich vorher nicht einmal übersetzen |
| 3 | `mvnw` als ausführbar markiert |

Alles liegt im mitgelieferten Backend-Paket auf dem Branch
`feature/cors-fuer-angular-frontend`. Die Commits sind getrennt, Commit 2
und 3 lassen sich also weglassen, falls nur die CORS-Änderung erwünscht ist.

---

## 1. Warum überhaupt?

Frontend und Backend laufen auf verschiedenen Ports:

| Anwendung | Adresse                 |
|-----------|-------------------------|
| Frontend  | `http://localhost:4300` |
| Backend   | `http://localhost:9190` |

Für den Browser sind das zwei verschiedene *Origins*. Ohne CORS-Freigabe
blockiert er jeden Aufruf aus dem Frontend, **bevor** Spring Security das
Keycloak-Token überhaupt auswerten kann. In der Konsole erscheint dann:

```text
Access to XMLHttpRequest at 'http://localhost:9190/api/bugs' from origin
'http://localhost:4300' has been blocked by CORS policy
```

Besonders zu beachten: Der Browser schickt vor jedem `PUT`, `POST` und
`DELETE` mit `Authorization`-Header zuerst eine `OPTIONS`-Anfrage
(*Preflight*). Diese trägt **kein** Token. Wird sie von Spring Security
abgewiesen, schlägt der eigentliche Aufruf fehl, obwohl das Token gültig ist.
Deshalb muss die CORS-Verarbeitung **vor** der Autorisierung greifen.

---

## 2. Neue Datei `config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4300}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

Erläuterungen:

* **`Authorization` in `setAllowedHeaders`** &ndash; ohne diesen Eintrag lehnt der
  Browser den Bearer-Token-Header ab.
* **`setAllowCredentials(false)`** &ndash; die Anwendung arbeitet zustandslos mit
  Bearer-Token, nicht mit Cookies. Damit bleibt `setAllowedOrigins` mit
  einer konkreten Adresse zulässig.
* **`/api/**`** &ndash; die Freigabe gilt nur für die Schnittstelle, nicht für
  Swagger UI.

---

## 3. Geänderte Datei `config/SecurityConfig.java`

```diff
-    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
+    public SecurityFilterChain filterChain(HttpSecurity http,
+                                           CorsConfigurationSource corsConfigurationSource) throws Exception {
         http
+                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                 .csrf(AbstractHttpConfigurer::disable)
```

Der `CorsFilter` läuft dadurch früh in der Filterkette und beantwortet den
`OPTIONS`-Preflight, bevor die Autorisierung greift.

---

## 4. Ergänzung in `application.yaml`

```yaml
# Freigabe fuer das Angular-Frontend (CORS).
# Mehrere Origins koennen mit Komma getrennt werden.
app:
  cors:
    allowed-origins: http://localhost:4300
```

Für einen späteren Betrieb genügt es, hier die Produktionsadresse
einzutragen &ndash; am Java-Code muss nichts geändert werden.

---

## 5. Alternative ohne Backend-Änderung

Das Frontend funktioniert im Entwicklungsbetrieb **auch ohne** diese
Änderung. `npm start` nutzt `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:9190",
    "secure": false,
    "changeOrigin": true
  }
}
```

Der Angular-Dev-Server nimmt die Aufrufe auf `/api` selbst entgegen und
reicht sie an das Backend weiter. Für den Browser bleibt alles auf einem
Origin, CORS entfällt.

Für den **Produktionsbuild** greift dieser Proxy nicht mehr &ndash; dort spricht
das Frontend `http://localhost:9190/api` direkt an. Deshalb ist die
CORS-Freigabe der saubere Weg.

---

## 6. Prüfen

```bash
curl -i -X OPTIONS http://localhost:9190/api/bugs \
  -H "Origin: http://localhost:4300" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization"
```

Erwartet wird `HTTP/1.1 200` mit den Kopfzeilen:

```text
Access-Control-Allow-Origin: http://localhost:4300
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```


---

## 7. Reparatur der Testsuite (zweiter Commit)

`mvn test` und `mvn package` schlugen im Ausgangszustand fehl – nicht wegen
fehlgeschlagener Tests, sondern weil sich die **Test-Quellen nicht
übersetzen liessen**. Damit war auch kein Jar baubar.

Ursache: `BugControllerTest` und `BugRepositoryTest` waren bereits auf die
Paketnamen von Spring Boot 4 umgestellt, die Project- und Comment-Pendants
nicht.

| Datei | Befund | Behebung |
|-------|--------|----------|
| `CommentRepositoryTest`, `ProjectRepositoryTest` | `@DataJpaTest` ohne Import; JUnit-Assertions ohne Import | Importe ergänzt (`org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`) |
| `ProjectControllerTest`, `CommentControllerTest` | Import `org.junit.jupiter.api.MediaType` – diese Klasse gibt es nicht | auf `org.springframework.http.MediaType` korrigiert |
| dieselben | `AutoConfigureMockMvc` und die statischen MockMvc-Importe fehlten | ergänzt |
| `ProjectControllerTest` | Feld `objectMapper` wurde verwendet, war aber nie deklariert | wie in `BugControllerTest` selbst gebaut, mit `JavaTimeModule` für die `LocalDateTime`-Felder |
| `ProjectControllerTest`, `CommentControllerTest` | `@WithMockUser` lieferte HTTP 401 | auf `jwt()`-Post-Processoren umgestellt – die Anwendung ist ein OAuth2-Resource-Server und verlangt ein Bearer-Token. `BugControllerTest` machte das bereits so |

Zusätzlich neu: **`src/test/resources/application.yaml`**. Die Tests liefen
vorher gegen die echte PostgreSQL auf `localhost:5432` und brauchten ausserdem
ein erreichbares Keycloak. Jetzt verwenden sie H2 im Arbeitsspeicher (die
Abhängigkeit stand bereits ungenutzt im `pom.xml`) und `jwk-set-uri` statt
`issuer-uri`, damit beim Start kein Netzwerkzugriff nötig ist.

Ergebnis:

```text
Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## 8. Ausführungsrecht für mvnw (dritter Commit)

`mvnw` war mit Modus `100644` eingecheckt. Unter Linux und macOS scheitert
`./mvnw` damit an „Permission denied" – der dokumentierte Weg zum Bauen
funktionierte dort also nicht. Unter Windows fällt es nicht auf, weil dort
`mvnw.cmd` verwendet wird.
