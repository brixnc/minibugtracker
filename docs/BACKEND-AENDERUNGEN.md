# Änderungen am Backend

Für das Frontend war **eine** Ergänzung am Repository
[brixnc/minibugtracker](https://github.com/brixnc/minibugtracker) nötig:
eine CORS-Freigabe. Die Fachlogik, das Datenmodell und die Berechtigungen
bleiben unverändert.

Die Änderung liegt im mitgelieferten Backend-Paket auf dem Branch
`feature/cors-fuer-angular-frontend`.

---

## 1. Warum überhaupt?

Frontend und Backend laufen auf verschiedenen Ports:

| Anwendung | Adresse                 |
|-----------|-------------------------|
| Frontend  | `http://localhost:4200` |
| Backend   | `http://localhost:9090` |

Für den Browser sind das zwei verschiedene *Origins*. Ohne CORS-Freigabe
blockiert er jeden Aufruf aus dem Frontend, **bevor** Spring Security das
Keycloak-Token überhaupt auswerten kann. In der Konsole erscheint dann:

```text
Access to XMLHttpRequest at 'http://localhost:9090/api/bugs' from origin
'http://localhost:4200' has been blocked by CORS policy
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

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
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
    allowed-origins: http://localhost:4200
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
    "target": "http://localhost:9090",
    "secure": false,
    "changeOrigin": true
  }
}
```

Der Angular-Dev-Server nimmt die Aufrufe auf `/api` selbst entgegen und
reicht sie an das Backend weiter. Für den Browser bleibt alles auf einem
Origin, CORS entfällt.

Für den **Produktionsbuild** greift dieser Proxy nicht mehr &ndash; dort spricht
das Frontend `http://localhost:9090/api` direkt an. Deshalb ist die
CORS-Freigabe der saubere Weg.

---

## 6. Prüfen

```bash
curl -i -X OPTIONS http://localhost:9090/api/bugs \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization"
```

Erwartet wird `HTTP/1.1 200` mit den Kopfzeilen:

```text
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```
