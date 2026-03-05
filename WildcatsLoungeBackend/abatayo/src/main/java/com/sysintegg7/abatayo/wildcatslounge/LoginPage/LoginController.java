package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginController {
    
    @Autowired
    private LoginService loginService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody LoginDTO loginDTO) {
        AuthResponse result = loginService.authenticate(loginDTO);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new AuthResponse(true, "Logout successful", null, null, null, 0));
    }
    
    @GetMapping("/users/{email}")
    public ResponseEntity<?> getByEmail(@PathVariable String email) {
        LoginDTO result = loginService.findByEmail(email);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    
    @PutMapping("/users/{id}/last-login")
    public ResponseEntity<?> updateLastLogin(@PathVariable Long id) {
        LoginDTO result = loginService.updateLastLogin(id);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}
