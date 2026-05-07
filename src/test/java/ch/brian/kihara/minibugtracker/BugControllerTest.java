package ch.brian.kihara.minibugtracker.bug;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * JUnit test for the BugController, testing all CRUD endpoints.
 *
 * @SpringBootTest loads the entire application context (so the real BugService and
 *   BugRepository are used).
 * @AutoConfigureMockMvc gives us a MockMvc to send fake HTTP requests.
 * @WithMockUser(roles = "ADMIN") fakes a logged-in admin so security doesn't block us.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ADMIN")
public class BugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BugRepository bugRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Helper that builds a sample Bug for use in the tests.
     */
    private Bug createTestBug() {
        Bug bug = new Bug();
        bug.setTitle("Controller Test Bug");
        bug.setDescription("Test description");
        bug.setStatus(BugStatus.OPEN);
        bug.setPriority(BugPriority.MEDIUM);
        return bug;
    }

    // READ all
    @Test
    void testGetAllBugs() throws Exception {
        mockMvc.perform(get("/api/bugs"))
                .andExpect(status().isOk());
    }

    // CREATE
    @Test
    void testCreateBug() throws Exception {
        String json = objectMapper.writeValueAsString(createTestBug());

        mockMvc.perform(post("/api/bugs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Controller Test Bug"));
    }

    // UPDATE
    @Test
    void testUpdateBug() throws Exception {
        // First save a bug to update
        Bug saved = bugRepository.save(createTestBug());
        saved.setStatus(BugStatus.CLOSED);
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/bugs/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    // DELETE
    @Test
    void testDeleteBug() throws Exception {
        Bug saved = bugRepository.save(createTestBug());

        mockMvc.perform(delete("/api/bugs/" + saved.getId()))
                .andExpect(status().isOk());
    }
}