package com.sprintflow.repository;

import com.sprintflow.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findAllByOrderByStartDateDesc();
}
