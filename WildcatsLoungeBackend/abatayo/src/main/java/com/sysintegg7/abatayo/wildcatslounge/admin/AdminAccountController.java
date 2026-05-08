package com.sysintegg7.abatayo.wildcatslounge.admin;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import com.sysintegg7.abatayo.wildcatslounge.auth.UserInfo;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/superadmin/accounts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://wildcats-lounge-frontend.vercel.app"})
public class AdminAccountController {

    private final RegisterRepository registerRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountController(RegisterRepository registerRepository, PasswordEncoder passwordEncoder) {
        this.registerRepository = registerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/admins")
    public ResponseEntity<AuthResponse> createAdminAccount(@Valid @RequestBody CreateAdminRequest request) {
        if (registerRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    AuthResponse.builder()
                            .success(false)
                            .message("Email already registered")
                            .build()
            );
        }

        RegisterEntity entity = new RegisterEntity();
        entity.setFirstName(request.getFirstName().trim());
        entity.setLastName(request.getLastName().trim());
        entity.setEmail(request.getEmail().trim().toLowerCase());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setRole("ADMIN");
        entity.setCreatedAt(String.valueOf(System.currentTimeMillis()));

        RegisterEntity savedEntity = registerRepository.save(entity);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                AuthResponse.builder()
                        .success(true)
                        .message("Admin account created")
                        .user(UserInfo.builder()
                                .id(savedEntity.getId())
                                .email(savedEntity.getEmail())
                                .firstName(savedEntity.getFirstName())
                                .lastName(savedEntity.getLastName())
                                .fullName(savedEntity.getFirstName() + " " + savedEntity.getLastName())
                                .role(savedEntity.getRole())
                                .createdAt(savedEntity.getCreatedAt())
                                .build())
                        .build()
        );
    }
}
