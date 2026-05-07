package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.bug.Bug;
import ch.brian.kihara.minibugtracker.bug.BugPriority;
import ch.brian.kihara.minibugtracker.bug.BugRepository;
import ch.brian.kihara.minibugtracker.bug.BugStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * JUnit test for the BugRepository.
 *
 * @DataJpaTest tells Spring to load only the JPA layer for this test.
 * It automatically uses an in-memory H2 database, so the real
 * PostgreSQL database stays untouched and the tests run fast.
 *
 * Tests all four CRUD operations: Create, Read, Update, Delete.
 */
@DataJpaTest
public class BugRepositoryTest {

    // Spring injects the real repository, but it's wired to the in-memory DB.
    @Autowired
    private BugRepository bugRepository;

    /**
     * Helper that builds a sample Bug we can save during the tests.
     * Avoids repeating the same code in every test method.
     */
    private Bug createTestBug() {
        Bug bug = new Bug();
        bug.setTitle("Test Bug");
        bug.setDescription("Something is broken");
        bug.setStatus(BugStatus.OPEN);
        bug.setPriority(BugPriority.HIGH);
        return bug;
    }

    // CREATE
    @Test
    void testCreate() {
        // Save a new bug to the database
        Bug saved = bugRepository.save(createTestBug());

        // The DB should have generated an ID
        assertNotNull(saved.getId());
        // And the title should still be what we set
        assertEquals("Test Bug", saved.getTitle());
    }

    // READ
    @Test
    void testRead() {
        // First create a bug...
        Bug saved = bugRepository.save(createTestBug());

        // ...then read it back by its ID
        Optional<Bug> found = bugRepository.findById(saved.getId());

        // It should exist
        assertTrue(found.isPresent());
        assertEquals("Test Bug", found.get().getTitle());
    }

    // UPDATE
    @Test
    void testUpdate() {
        // Create a bug
        Bug saved = bugRepository.save(createTestBug());

        // Change something on it and save again
        saved.setStatus(BugStatus.CLOSED);
        Bug updated = bugRepository.save(saved);

        // The change should be persisted
        assertEquals(BugStatus.CLOSED, updated.getStatus());
    }

    // DELETE
    @Test
    void testDelete() {
        // Create a bug
        Bug saved = bugRepository.save(createTestBug());

        // Delete it
        bugRepository.deleteById(saved.getId());

        // It should no longer be found in the database
        assertFalse(bugRepository.findById(saved.getId()).isPresent());
    }
}