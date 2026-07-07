package com.sprintflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class TaskDtos {

    public static class CreateTaskRequest {
        @NotNull
        public Long sprintId;

        @NotBlank
        public String title;

        public String description;

        @NotNull
        public LocalDate taskDate;

        @NotNull @PositiveOrZero
        public Double estimatedHours;

        public Long assignedToId; // optional - defaults to the creator
    }

    public static class UpdateTaskRequest {
        public String title;
        public String description;
        public LocalDate taskDate;
        public Double estimatedHours;
        public Double loggedHours;
        public String status; // TODO | IN_PROGRESS | DONE | BLOCKED
    }

    public static class LogHoursRequest {
        @NotNull @PositiveOrZero
        public Double hours;
    }

    public static class TaskResponse {
        public Long id;
        public Long sprintId;
        public Long assignedToId;
        public String assignedToName;
        public String title;
        public String description;
        public LocalDate taskDate;
        public Double estimatedHours;
        public Double loggedHours;
        public String status;

        public TaskResponse(Long id, Long sprintId, Long assignedToId, String assignedToName,
                             String title, String description, LocalDate taskDate,
                             Double estimatedHours, Double loggedHours, String status) {
            this.id = id;
            this.sprintId = sprintId;
            this.assignedToId = assignedToId;
            this.assignedToName = assignedToName;
            this.title = title;
            this.description = description;
            this.taskDate = taskDate;
            this.estimatedHours = estimatedHours;
            this.loggedHours = loggedHours;
            this.status = status;
        }
    }
}
