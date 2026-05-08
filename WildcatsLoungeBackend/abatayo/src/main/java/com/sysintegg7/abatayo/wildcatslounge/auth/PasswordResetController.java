package com.sysintegg7.abatayo.wildcatslounge.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth/password")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        boolean result = passwordResetService.sendPasswordResetEmail(request.getEmail());
        
        return ResponseEntity.ok(
            ForgotPasswordResponse.builder()
                .success(result)
                .message("If this email exists in our system, a password reset link will be sent shortly.")
                .build()
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        if (!passwordResetService.validateToken(request.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ResetPasswordResponse.builder()
                    .success(false)
                    .message("Invalid or expired reset link")
                    .build()
            );
        }

        boolean result = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

        if (result) {
            return ResponseEntity.ok(
                ResetPasswordResponse.builder()
                    .success(true)
                    .message("Password reset successfully. You can now log in with your new password.")
                    .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResetPasswordResponse.builder()
                    .success(false)
                    .message("Failed to reset password. Please try again.")
                    .build()
            );
        }
    }

    @GetMapping("/validate-token/{token}")
    public ResponseEntity<ValidateTokenResponse> validateToken(@PathVariable String token) {
        boolean isValid = passwordResetService.validateToken(token);
        
        return ResponseEntity.ok(
            ValidateTokenResponse.builder()
                .valid(isValid)
                .message(isValid ? "Token is valid" : "Token is invalid or expired")
                .build()
        );
    }
}
