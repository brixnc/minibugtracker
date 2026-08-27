package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.Project.Project;
import ch.brian.kihara.minibugtracker.Project.ProjectRepository;
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

@SpringBootTest
@AutoConfigureMockMvc
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private Project createTestProject() {
        Project p = new Project();
        p.setName("Controller Project");
        p.setDescription("Controller test description");
        return p;
    }

    // Baut ein Test-JWT mit der Berechtigung ROLE_ADMIN.
    // @WithMockUser funktioniert hier nicht: Die Anwendung ist ein
    // OAuth2-Resource-Server und weist Anfragen ohne Bearer-Token mit 401 ab.
    private static org.springframework.test.web.servlet.request.RequestPostProcessor adminJwt() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Test
    void testGetAllProjects() throws Exception {
        mockMvc.perform(get("/api/projects").with(adminJwt()))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateProject() throws Exception {
        String json = objectMapper.writeValueAsString(createTestProject());

        mockMvc.perform(post("/api/projects")
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Controller Project"));
    }

    @Test
    void testUpdateProject() throws Exception {
        Project saved = projectRepository.save(createTestProject());
        saved.setName("Updated");
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/projects/" + saved.getId())
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void testDeleteProject() throws Exception {
        Project saved = projectRepository.save(createTestProject());

        mockMvc.perform(delete("/api/projects/" + saved.getId()).with(adminJwt()))
                .andExpect(status().isOk());
    }
}