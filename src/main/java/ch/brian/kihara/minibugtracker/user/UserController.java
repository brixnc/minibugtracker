package ch.brian.kihara.minibugtracker.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller", description = "Current user info from the JWT")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Get current authenticated user")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "username", jwt.getClaimAsString("preferred_username"),
                "email",    jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
                "subject",  jwt.getSubject(),
                "roles",    extractRoles(jwt)
        );
    }

    @GetMapping("/me/roles")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Get roles of the current user")
    public List<String> getCurrentUserRoles(@AuthenticationPrincipal Jwt jwt) {
        return extractRoles(jwt);
    }

    @GetMapping("/admin/check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin-only endpoint to verify role separation")
    public Map<String, String> adminCheck(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("message", "Hello admin " + jwt.getClaimAsString("preferred_username"));
    }

    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) return List.of();
        return (List<String>) realmAccess.getOrDefault("roles", List.of());
    }
}