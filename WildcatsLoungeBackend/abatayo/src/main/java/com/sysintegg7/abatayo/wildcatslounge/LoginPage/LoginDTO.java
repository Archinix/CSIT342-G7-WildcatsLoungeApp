package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @ValidPassword
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    private Long id;
    private String createdAt;
    private String lastLogin;
}
