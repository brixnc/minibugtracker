package ch.brian.kihara.minibugtracker.bug;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BugService {

    private final BugRepository bugRepository;

    public BugService(BugRepository bugRepository) {
        this.bugRepository = bugRepository;
    }

    public List<Bug> getAllBugs() {
        return bugRepository.findAll();
    }

    public Bug getBugById(Long id) {
        return bugRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Bug not found with id: " + id));
    }

    public Bug createBug(Bug bug) {
        return bugRepository.save(bug);
    }

    public Bug updateBug(Long id, Bug updatedBug) {
        Bug existing = getBugById(id);
        existing.setTitle(updatedBug.getTitle());
        existing.setDescription(updatedBug.getDescription());
        existing.setStatus(updatedBug.getStatus());
        existing.setPriority(updatedBug.getPriority());
        return bugRepository.save(existing);
    }

    public void deleteBug(Long id) {
        getBugById(id); // throws 404 if not found
        bugRepository.deleteById(id);
    }
}