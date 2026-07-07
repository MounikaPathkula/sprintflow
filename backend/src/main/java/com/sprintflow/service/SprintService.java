package com.sprintflow.service;

import com.sprintflow.dto.SprintDtos.*;
import com.sprintflow.model.Sprint;
import com.sprintflow.model.Task;
import com.sprintflow.model.TaskStatus;
import com.sprintflow.model.User;
import com.sprintflow.repository.SprintRepository;
import com.sprintflow.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    public SprintService(SprintRepository sprintRepository, TaskRepository taskRepository) {
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
    }

    public SprintResponse createSprint(CreateSprintRequest req, User creator) {
        if (req.endDate.isBefore(req.startDate)) {
            throw new IllegalArgumentException("End date must be on or after the start date");
        }
        Sprint sprint = new Sprint(req.name, req.startDate, req.endDate, creator);
        sprint = sprintRepository.save(sprint);
        return toResponse(sprint, List.of());
    }

    public List<SprintResponse> listSprints() {
        return sprintRepository.findAllByOrderByStartDateDesc().stream()
                .map(s -> toResponse(s, taskRepository.findBySprintIdOrderByTaskDateAsc(s.getId())))
                .toList();
    }

    public SprintResponse getSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        return toResponse(sprint, taskRepository.findBySprintIdOrderByTaskDateAsc(id));
    }

    private SprintResponse toResponse(Sprint sprint, List<Task> tasks) {
        int total = tasks.size();
        int completed = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        double totalEstimated = tasks.stream().mapToDouble(Task::getEstimatedHours).sum();
        double totalLogged = tasks.stream().mapToDouble(Task::getLoggedHours).sum();
        double progress = total == 0 ? 0.0 : (completed * 100.0) / total;

        return new SprintResponse(
                sprint.getId(),
                sprint.getName(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getCreatedBy().getName(),
                Math.round(progress * 10) / 10.0,
                total,
                completed,
                totalEstimated,
                totalLogged
        );
    }
}
