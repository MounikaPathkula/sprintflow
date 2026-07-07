package com.sprintflow.controller;

import com.sprintflow.dto.SprintDtos.*;
import com.sprintflow.model.User;
import com.sprintflow.service.SprintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping
    public ResponseEntity<SprintResponse> create(@Valid @RequestBody CreateSprintRequest req,
                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sprintService.createSprint(req, user));
    }

    @GetMapping
    public ResponseEntity<List<SprintResponse>> list() {
        return ResponseEntity.ok(sprintService.listSprints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprint(id));
    }
}
