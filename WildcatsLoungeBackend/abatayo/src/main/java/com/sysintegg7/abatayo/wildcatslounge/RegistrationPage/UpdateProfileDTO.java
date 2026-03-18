package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileDTO {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, message = "First name should be at least 2 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, message = "Last name should be at least 2 characters")
    private String lastName;
}
