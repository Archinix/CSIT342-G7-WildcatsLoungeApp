package com.sysintegg7.abatayo.wildcatslounge.auth;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://wildcats-lounge-frontend.vercel.app"})
public class AuthController {

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private RegisterRepository registerRepository;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        boolean emailExists = registerRepository.existsByEmail(request.getEmail());
        
        if (!emailExists) {
            // Don't reveal if email exists for security reasons
            return ResponseEntity.ok(new AuthResponse(true, "If an account exists with that email, you will receive a password reset link", null, null, null, 0));
        }
        
        boolean emailSent = passwordResetService.sendPasswordResetEmail(request.getEmail());
        
        if (emailSent) {
            return ResponseEntity.ok(new AuthResponse(true, "Password reset email sent", null, null, null, 0));
        }
        
        return ResponseEntity.status(500).body(new AuthResponse(false, "Failed to send reset email", null, null, null, 0));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        boolean success = passwordResetService.resetPassword(token, newPassword);
        
        if (success) {
            return ResponseEntity.ok(new AuthResponse(true, "Password reset successful", null, null, null, 0));
        }
        
        return ResponseEntity.status(400).body(new AuthResponse(false, "Invalid or expired reset token", null, null, null, 0));
    }
}
