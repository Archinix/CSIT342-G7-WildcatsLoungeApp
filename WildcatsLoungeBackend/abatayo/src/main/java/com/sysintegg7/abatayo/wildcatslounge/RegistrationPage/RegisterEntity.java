package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "register")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @NotBlank(message = "First name is required")
    @Size(min = 2, message = "First name should be at least 2 characters")
    private String firstName;
    
    @Column(nullable = false)
    @NotBlank(message = "Last name is required")
    @Size(min = 2, message = "Last name should be at least 2 characters")
    private String lastName;
    
    @Column(nullable = false, unique = true)
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    @ValidPassword
    private String password;

    @Column
    private String role = "CUSTOMER";
    
    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "photo_data")
    private byte[] photoData;

    @Column(name = "photo_filename")
    private String photoFilename;

    @Column(name = "photo_mime_type")
    private String photoMimeType;
}
