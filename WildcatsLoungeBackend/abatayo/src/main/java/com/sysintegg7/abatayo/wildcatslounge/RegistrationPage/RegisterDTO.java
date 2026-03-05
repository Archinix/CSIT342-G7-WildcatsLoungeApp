package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, message = "First name should be at least 2 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, message = "Last name should be at least 2 characters")
    private String lastName;
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @ValidPassword
    private String password;
    
    private Long id;
    private String createdAt;
}
