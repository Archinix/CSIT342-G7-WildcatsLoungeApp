package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

@Entity
@Table(name = "login")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    @ValidPassword
    private String password;
    
    @Column(name = "created_at")
    private String createdAt;
    
    @Column(name = "last_login")
    private String lastLogin;
}
