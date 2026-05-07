package ch.brian.kihara.minibugtracker;

import ch.brian.kihara.minibugtracker.Comment.Comment;
import ch.brian.kihara.minibugtracker.Comment.CommentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Comment createTestComment() {
        Comment c = new Comment();
        c.setContent("Test comment");
        c.setAuthor("Tester");
        c.setBugId(1L);
        return c;
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllComments() throws Exception {
        mockMvc.perform(get("/api/comments"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateComment() throws Exception {
        String json = objectMapper.writeValueAsString(createTestComment());

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author").value("Tester"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateComment() throws Exception {
        Comment saved = commentRepository.save(createTestComment());
        saved.setContent("Updated");
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/comments/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Updated"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteComment() throws Exception {
        Comment saved = commentRepository.save(createTestComment());

        mockMvc.perform(delete("/api/comments/" + saved.getId()))
                .andExpect(status().isOk());
    }
}