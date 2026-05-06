package ch.brian.kihara.minibugtracker.bug;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface   BugRepository extends JpaRepository<Bug, Long> {
    // JPA gives you findAll, findById, save, deleteById for free
    List<Bug> findByStatus(BugStatus status);}