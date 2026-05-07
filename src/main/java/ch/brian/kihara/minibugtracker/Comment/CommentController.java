package ch.brian.kihara.minibugtracker.Comment;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all comments")
    @ApiResponse(responseCode = "200", description = "List of comments returned")
    public List<Comment> getAllComments() {
        return commentService.getAllComments();
    }

    @GetMapping("/bug/{bugId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all comments for a specific bug")
    @ApiResponse(responseCode = "200", description = "Comments for bug returned")
    public List<Comment> getCommentsByBugId(
            @Parameter(description = "ID of the bug") @PathVariable Long bugId) {
        return commentService.getCommentsByBugId(bugId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get comment by ID")
    @ApiResponse(responseCode = "200", description = "Comment found")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public Comment getCommentById(@PathVariable Long id) {
        return commentService.getCommentById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create a new comment")
    @ApiResponse(responseCode = "200", description = "Comment created")
    public Comment createComment(@Valid @RequestBody Comment comment) {
        return commentService.createComment(comment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a comment")
    @ApiResponse(responseCode = "200", description = "Comment updated")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public Comment updateComment(@PathVariable Long id, @Valid @RequestBody Comment comment) {
        return commentService.updateComment(id, comment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a comment")
    @ApiResponse(responseCode = "200", description = "Comment deleted")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}