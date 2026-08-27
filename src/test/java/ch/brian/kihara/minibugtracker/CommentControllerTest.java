package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.Comment.Comment;
import ch.brian.kihara.minibugtracker.Comment.CommentRepository;
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
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommentRepository commentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private Comment createTestComment() {
        Comment c = new Comment();
        c.setContent("Test comment");
        c.setAuthor("Tester");
        c.setBugId(1L);
        return c;
    }

    // Baut ein Test-JWT mit der Berechtigung ROLE_ADMIN.
    // @WithMockUser funktioniert hier nicht: Die Anwendung ist ein
    // OAuth2-Resource-Server und weist Anfragen ohne Bearer-Token mit 401 ab.
    private static org.springframework.test.web.servlet.request.RequestPostProcessor adminJwt() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Test
    void testGetAllComments() throws Exception {
        mockMvc.perform(get("/api/comments").with(adminJwt()))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateComment() throws Exception {
        String json = objectMapper.writeValueAsString(createTestComment());

        mockMvc.perform(post("/api/comments")
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author").value("Tester"));
    }

    @Test
    void testUpdateComment() throws Exception {
        Comment saved = commentRepository.save(createTestComment());
        saved.setContent("Updated");
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/comments/" + saved.getId())
                        .with(adminJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Updated"));
    }

    @Test
    void testDeleteComment() throws Exception {
        Comment saved = commentRepository.save(createTestComment());

        mockMvc.perform(delete("/api/comments/" + saved.getId()).with(adminJwt()))
                .andExpect(status().isOk());
    }
}