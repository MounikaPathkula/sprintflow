package com.sprintflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank
        public String name;

        @NotBlank @Email
        public String email;

        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        public String password;
    }

    public static class LoginRequest {
        @NotBlank @Email
        public String email;

        @NotBlank
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public UserDto user;

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }
    }

    public static class UserDto {
        public Long id;
        public String name;
        public String email;
        public String role;

        public UserDto(Long id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }
}
