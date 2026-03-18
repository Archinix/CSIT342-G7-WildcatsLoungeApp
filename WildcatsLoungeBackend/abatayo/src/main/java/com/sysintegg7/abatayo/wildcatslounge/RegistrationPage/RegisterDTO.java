package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    private Long id;
    private String createdAt;
    
    private byte[] photoData;
    private String photoFilename;
    private String photoMimeType;
}
