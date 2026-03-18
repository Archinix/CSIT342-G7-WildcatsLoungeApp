package com.sysintegg7.abatayo.wildcatslounge.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class ChangePasswordController {
    
    @Autowired
    private RegisterService registerService;
    
    @PostMapping("/users/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @Valid @RequestBody ChangePasswordRequest request) {
        boolean success = registerService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        
        if (success) {
            return ResponseEntity.ok(new AuthResponse(true, "Password changed successfully", null, null, null, 0));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, "Current password is incorrect", null, null, null, 0));
    }
}
