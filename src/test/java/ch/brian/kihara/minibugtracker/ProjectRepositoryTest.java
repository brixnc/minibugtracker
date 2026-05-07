package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.Project.Project;
import ch.brian.kihara.minibugtracker.Project.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

@DataJpaTest
public class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    private Project createTestProject() {
        Project p = new Project();
        p.setName("Test Project");
        p.setDescription("A project for testing");
        return p;
    }

    @Test
    void testCreate() {
        Project saved = projectRepository.save(createTestProject());
        assertNotNull(saved.getId());
        assertEquals("Test Project", saved.getName());
    }

    @Test
    void testRead() {
        Project saved = projectRepository.save(createTestProject());
        Optional<Project> found = projectRepository.findById(saved.getId());
        assertTrue(found.isPresent());
    }

    @Test
    void testUpdate() {
        Project saved = projectRepository.save(createTestProject());
        saved.setName("Updated Name");
        Project updated = projectRepository.save(saved);
        assertEquals("Updated Name", updated.getName());
    }

    @Test
    void testDelete() {
        Project saved = projectRepository.save(createTestProject());
        projectRepository.deleteById(saved.getId());
        assertFalse(projectRepository.findById(saved.getId()).isPresent());
    }
}