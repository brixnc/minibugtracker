package ch.brian.kihara.minibugtracker;

@SpringBootTest
@AutoConfigureMockMvc
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Project createTestProject() {
        Project p = new Project();
        p.setName("Controller Project");
        p.setDescription("Controller test description");
        return p;
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllProjects() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateProject() throws Exception {
        String json = objectMapper.writeValueAsString(createTestProject());

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Controller Project"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateProject() throws Exception {
        Project saved = projectRepository.save(createTestProject());
        saved.setName("Updated");
        String json = objectMapper.writeValueAsString(saved);

        mockMvc.perform(put("/api/projects/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteProject() throws Exception {
        Project saved = projectRepository.save(createTestProject());

        mockMvc.perform(delete("/api/projects/" + saved.getId()))
                .andExpect(status().isOk());
    }
}