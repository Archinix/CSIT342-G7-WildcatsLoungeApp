package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import com.sysintegg7.abatayo.wildcatslounge.validation.ValidPassword;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Transient
    private String firstName;
    
    @Transient
    private String lastName;

    @Column(name = "full_name", nullable = false)
    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Full name should be at least 2 characters")
    private String fullName;
    
    @Column(nullable = false, unique = true)
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(name = "password_hash", nullable = false)
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

    @PostLoad
    private void hydrateNamesFromFullName() {
        if (fullName == null || fullName.isBlank()) {
            if (firstName == null) {
                firstName = "";
            }
            if (lastName == null) {
                lastName = "";
            }
            return;
        }

        String[] parts = fullName.trim().split("\\s+", 2);
        firstName = parts[0];
        lastName = parts.length > 1 ? parts[1] : "";
    }

    @PrePersist
    @PreUpdate
    private void composeFullName() {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();

        if (!first.isEmpty() || !last.isEmpty()) {
            fullName = (first + " " + last).trim();
        } else if (fullName == null || fullName.isBlank()) {
            fullName = "Unknown User";
        }
    }

    public String getFirstName() {
        if ((firstName == null || firstName.isBlank()) && fullName != null) {
            hydrateNamesFromFullName();
        }
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        composeFullName();
    }

    public String getLastName() {
        if ((lastName == null || lastName.isBlank()) && fullName != null) {
            hydrateNamesFromFullName();
        }
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        composeFullName();
    }
}
