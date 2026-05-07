package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.bug.Bug;
import ch.brian.kihara.minibugtracker.bug.BugPriority;
import ch.brian.kihara.minibugtracker.bug.BugRepository;
import ch.brian.kihara.minibugtracker.bug.BugStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * JUnit test for the BugController, testing all CRUD endpoints.
 *
 * Uses .with(jwt()) on each request to simulate an authenticated admin user,
 * because the security config uses OAuth2 Resource Server with JWT.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class BugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BugRepository bugRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private Bug createTestBug() {
        Bug bug = new Bug();
        bug.setTitle("Controller Test Bug");
        bug.setDescription("Test description");
        bug.setStatus(BugStatus.OPEN);
        bug.setPriority(BugPriority.MEDIUM);
        return bug;
    }

    // Reusable: builds a fake JWT carrying ROLE_ADMIN authority
    private static org.springframework.test.web.servlet.request.RequestPostProcessor adminJwt() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    // READ all
    @Test
    void testGetAllBugs() throws Exception {
        mockMvc.perform(get("/api/bugs").with(adminJwt()))
                .andExpect(status().isOk());
    }

    // CREATE
    @Test
    void testCreateBug() throws Exception {
        String json = objectMapper.writeValueAsString(createTestBug());

        mockMvc.perform(post("/api/bugs")
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Controller Test Bug"));
    }

    // UPDATE
    @Test
    void testUpdateBug() throws Exception {
        Bug saved = bugRepository.save(createTestBug());
        saved.setStatus(BugStatus.CLOSED);
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/bugs/" + saved.getId())
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    // DELETE
    @Test
    void testDeleteBug() throws Exception {
        Bug saved = bugRepository.save(createTestBug());

        mockMvc.perform(delete("/api/bugs/" + saved.getId()).with(adminJwt()))
                .andExpect(status().isOk());
    }
}