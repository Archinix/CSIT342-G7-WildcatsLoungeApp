package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://csit-342-g7-wildcats-lounge-app.vercel.app"})
public class RegisterController {
    
    @Autowired
    private RegisterService registerService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterDTO registerDTO) {
        AuthResponse result = registerService.register(registerDTO);
        
        if (result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        RegisterDTO result = registerService.findById(id);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    
    @GetMapping("/users/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        RegisterDTO result = registerService.findByEmail(email);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateProfileDTO updateProfileDTO) {
        RegisterDTO result = registerService.updateUserProfile(id, updateProfileDTO);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}
