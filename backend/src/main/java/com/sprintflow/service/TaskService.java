package com.sprintflow.service;

import com.sprintflow.dto.TaskDtos.*;
import com.sprintflow.model.*;
import com.sprintflow.repository.SprintRepository;
import com.sprintflow.repository.TaskRepository;
import com.sprintflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, SprintRepository sprintRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.sprintRepository = sprintRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(CreateTaskRequest req, User creator) {
        Sprint sprint = sprintRepository.findById(req.sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        User assignee = req.assignedToId != null
                ? userRepository.findById(req.assignedToId)
                        .orElseThrow(() -> new IllegalArgumentException("Assigned user not found"))
                : creator;

        Task task = new Task();
        task.setSprint(sprint);
        task.setAssignedTo(assignee);
        task.setTitle(req.title);
        task.setDescription(req.description);
        task.setTaskDate(req.taskDate);
        task.setEstimatedHours(req.estimatedHours);
        task.setStatus(TaskStatus.TODO);

        task = taskRepository.save(task);
        return toResponse(task);
    }

    public List<TaskResponse> listTasksForSprint(Long sprintId) {
        return taskRepository.findBySprintIdOrderByTaskDateAsc(sprintId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse updateTask(Long taskId, UpdateTaskRequest req) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (req.title != null) task.setTitle(req.title);
        if (req.description != null) task.setDescription(req.description);
        if (req.taskDate != null) task.setTaskDate(req.taskDate);
        if (req.estimatedHours != null) task.setEstimatedHours(req.estimatedHours);
        if (req.loggedHours != null) task.setLoggedHours(req.loggedHours);
        if (req.status != null) task.setStatus(TaskStatus.valueOf(req.status));

        task = taskRepository.save(task);
        return toResponse(task);
    }

    public TaskResponse logHours(Long taskId, LogHoursRequest req) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.setLoggedHours(task.getLoggedHours() + req.hours);
        task = taskRepository.save(task);
        return toResponse(task);
    }

    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("Task not found");
        }
        taskRepository.deleteById(taskId);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getSprint().getId(),
                task.getAssignedTo().getId(),
                task.getAssignedTo().getName(),
                task.getTitle(),
                task.getDescription(),
                task.getTaskDate(),
                task.getEstimatedHours(),
                task.getLoggedHours(),
                task.getStatus().name()
        );
    }
}
