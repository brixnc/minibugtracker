package ch.brian.kihara.minibugtracker.bug;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all bugs")
    @ApiResponse(responseCode = "200", description = "List of bugs returned")
    public List<Bug> getAllBugs() {
        return bugService.getAllBugs();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get bug by ID")
    @ApiResponse(responseCode = "200", description = "Bug found")
    @ApiResponse(responseCode = "404", description = "Bug not found")
    public Bug getBugById(
            @Parameter(description = "ID of the bug") @PathVariable Long id) {
        return bugService.getBugById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create a new bug")
    @ApiResponse(responseCode = "200", description = "Bug created")
    public Bug createBug(@Valid @RequestBody Bug bug) {
        return bugService.createBug(bug);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a bug")
    @ApiResponse(responseCode = "200", description = "Bug updated")
    @ApiResponse(responseCode = "404", description = "Bug not found")
    public Bug updateBug(@PathVariable Long id, @Valid @RequestBody Bug bug) {
        return bugService.updateBug(id, bug);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a bug")
    @ApiResponse(responseCode = "200", description = "Bug deleted")
    @ApiResponse(responseCode = "404", description = "Bug not found")
    public void deleteBug(@PathVariable Long id) {
        bugService.deleteBug(id);
    }
}
