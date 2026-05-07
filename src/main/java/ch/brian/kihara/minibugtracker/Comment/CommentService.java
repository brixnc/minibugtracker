package ch.brian.kihara.minibugtracker.Comment;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public List<Comment> getCommentsByBugId(Long bugId) {
        return commentRepository.findByBugId(bugId);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found with id: " + id));
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Comment updateComment(Long id, Comment updatedComment) {
        Comment existing = getCommentById(id);
        existing.setContent(updatedComment.getContent());
        existing.setAuthor(updatedComment.getAuthor());
        return commentRepository.save(existing);
    }

    public void deleteComment(Long id) {
        getCommentById(id);
        commentRepository.deleteById(id);
    }
}