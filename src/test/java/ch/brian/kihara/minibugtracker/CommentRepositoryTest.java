package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.Comment.Comment;
import ch.brian.kihara.minibugtracker.Comment.CommentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
public class CommentRepositoryTest {

    @Autowired
    private CommentRepository commentRepository;

    private Comment createTestComment() {
        Comment c = new Comment();
        c.setContent("This is a comment");
        c.setAuthor("Tester");
        c.setBugId(1L);
        return c;
    }

    @Test
    void testCreate() {
        Comment saved = commentRepository.save(createTestComment());
        assertNotNull(saved.getId());
        assertEquals("Tester", saved.getAuthor());
    }

    @Test
    void testRead() {
        Comment saved = commentRepository.save(createTestComment());
        Optional<Comment> found = commentRepository.findById(saved.getId());
        assertTrue(found.isPresent());
    }

    @Test
    void testUpdate() {
        Comment saved = commentRepository.save(createTestComment());
        saved.setContent("Updated content");
        Comment updated = commentRepository.save(saved);
        assertEquals("Updated content", updated.getContent());
    }

    @Test
    void testDelete() {
        Comment saved = commentRepository.save(createTestComment());
        commentRepository.deleteById(saved.getId());
        assertFalse(commentRepository.findById(saved.getId()).isPresent());
    }

    @Test
    void testFindByBugId() {
        Comment saved = commentRepository.save(createTestComment());
        List<Comment> result = commentRepository.findByBugId(1L);
        assertFalse(result.isEmpty());
    }
}