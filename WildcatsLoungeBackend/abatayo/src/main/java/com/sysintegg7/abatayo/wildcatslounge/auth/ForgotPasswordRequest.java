package com.sysintegg7.abatayo.wildcatslounge.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
}
