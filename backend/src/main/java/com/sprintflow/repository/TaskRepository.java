package com.sprintflow.repository;

import com.sprintflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findBySprintIdOrderByTaskDateAsc(Long sprintId);
    List<Task> findBySprintIdAndAssignedToIdOrderByTaskDateAsc(Long sprintId, Long userId);
}
