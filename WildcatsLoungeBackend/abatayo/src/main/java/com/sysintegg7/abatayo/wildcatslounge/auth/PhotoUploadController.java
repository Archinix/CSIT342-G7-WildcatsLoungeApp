package com.sysintegg7.abatayo.wildcatslounge.auth;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PhotoUploadController {
    
    @Autowired
    private RegisterService registerService;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"};
    private static final byte[] EMPTY_PNG = new byte[] {
        (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4,
        (byte) 0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
        0x54, 0x78, (byte) 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte) 0xAE,
        0x42, 0x60, (byte) 0x82
    };
    
    @PostMapping("/users/{id}/upload-photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Validate file existence
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "File is required", null, null, null, 0));
            }
            
            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "File size exceeds 5MB limit", null, null, null, 0));
            }
            
            // Validate file type
            if (!isAllowedFileType(file.getContentType())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Only JPG and PNG files are allowed", null, null, null, 0));
            }
            
            // Upload photo
            boolean success = registerService.uploadPhoto(id, file.getBytes(), file.getOriginalFilename(), file.getContentType());
            
            if (success) {
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("success", true);
                response.put("message", "Photo uploaded successfully");

                Map<String, Object> fileReference = new LinkedHashMap<>();
                fileReference.put("userId", id);
                fileReference.put("fileName", file.getOriginalFilename());
                fileReference.put("mimeType", file.getContentType());
                fileReference.put("photoEndpoint", "/auth/users/" + id + "/photo");

                response.put("fileReference", fileReference);
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthResponse(false, "User not found", null, null, null, 0));
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Error uploading file: " + e.getMessage(), null, null, null, 0));
        }
    }
    
    @GetMapping("/users/{id}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable Long id) {
        byte[] photoData = registerService.getPhoto(id);
        
        if (photoData != null && photoData.length > 0) {
            return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(photoData);
        }

        // Return a transparent 1x1 PNG instead of 404 so image tags do not spam console errors.
        return ResponseEntity.ok()
            .header("Content-Type", "image/png")
            .body(EMPTY_PNG);
    }
    
    private boolean isAllowedFileType(String contentType) {
        if (contentType == null) {
            return false;
        }
        for (String type : ALLOWED_TYPES) {
            if (contentType.equalsIgnoreCase(type)) {
                return true;
            }
        }
        return false;
    }
}