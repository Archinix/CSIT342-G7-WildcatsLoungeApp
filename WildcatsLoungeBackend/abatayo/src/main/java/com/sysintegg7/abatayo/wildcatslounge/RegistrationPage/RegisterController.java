package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody RegisterDTO registerDTO) {
        RegisterDTO result = registerService.updateUser(id, registerDTO);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}
