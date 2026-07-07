package com.sprintflow.controller;

import com.sprintflow.dto.TaskDtos.*;
import com.sprintflow.model.User;
import com.sprintflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest req,
                                                @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.createTask(req, user));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> listForSprint(@RequestParam Long sprintId) {
        return ResponseEntity.ok(taskService.listTasksForSprint(sprintId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id, @RequestBody UpdateTaskRequest req) {
        return ResponseEntity.ok(taskService.updateTask(id, req));
    }

    @PostMapping("/{id}/log-hours")
    public ResponseEntity<TaskResponse> logHours(@PathVariable Long id, @Valid @RequestBody LogHoursRequest req) {
        return ResponseEntity.ok(taskService.logHours(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
