package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @ValidPassword
    private String password;
    
    private Long id;
    private String createdAt;
    private String lastLogin;
}
