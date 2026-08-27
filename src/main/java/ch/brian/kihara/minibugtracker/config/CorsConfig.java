package ch.brian.kihara.minibugtracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS-Konfiguration fuer das Angular-Frontend.
 *
 * Das Frontend laeuft im Entwicklungsbetrieb auf http://localhost:4200 und
 * damit auf einem anderen Origin als dieses Backend (http://localhost:9090).
 * Ohne diese Freigabe blockiert der Browser jeden Aufruf aus dem Frontend,
 * noch bevor Spring Security das JWT ueberhaupt sieht.
 *
 * Die erlaubten Origins lassen sich ueber die Eigenschaft
 * {@code app.cors.allowed-origins} in der application.yaml anpassen.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Der Authorization-Header traegt das Keycloak-Token und muss
        // ausdruecklich erlaubt sein.
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Location"));

        // Die Anwendung arbeitet zustandslos mit Bearer-Token, nicht mit
        // Cookies - daher werden keine Credentials benoetigt.
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
