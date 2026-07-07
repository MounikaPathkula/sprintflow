package com.sprintflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class SprintDtos {

    public static class CreateSprintRequest {
        @NotBlank
        public String name;

        @NotNull
        public LocalDate startDate;

        @NotNull
        public LocalDate endDate;
    }

    public static class SprintResponse {
        public Long id;
        public String name;
        public LocalDate startDate;
        public LocalDate endDate;
        public String createdByName;
        public double progressPercent;
        public int totalTasks;
        public int completedTasks;
        public double totalEstimatedHours;
        public double totalLoggedHours;

        public SprintResponse(Long id, String name, LocalDate startDate, LocalDate endDate,
                               String createdByName, double progressPercent, int totalTasks,
                               int completedTasks, double totalEstimatedHours, double totalLoggedHours) {
            this.id = id;
            this.name = name;
            this.startDate = startDate;
            this.endDate = endDate;
            this.createdByName = createdByName;
            this.progressPercent = progressPercent;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.totalEstimatedHours = totalEstimatedHours;
            this.totalLoggedHours = totalLoggedHours;
        }
    }
}
