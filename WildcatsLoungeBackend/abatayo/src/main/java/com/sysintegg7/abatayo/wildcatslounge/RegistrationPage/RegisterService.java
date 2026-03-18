package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import com.sysintegg7.abatayo.wildcatslounge.auth.JwtTokenProvider;
import com.sysintegg7.abatayo.wildcatslounge.auth.SupabaseAuthResult;
import com.sysintegg7.abatayo.wildcatslounge.auth.SupabaseAuthService;
import com.sysintegg7.abatayo.wildcatslounge.auth.UserInfo;

@Service
public class RegisterService {
    
    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private SupabaseAuthService supabaseAuthService;
    
    public AuthResponse register(RegisterDTO registerDTO) {
        // Check if email already exists
        if (registerRepository.existsByEmail(registerDTO.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email already registered")
                    .build();
        }

        SupabaseAuthResult supabaseResult = null;
        if (supabaseAuthService.isConfigured()) {
            supabaseResult = supabaseAuthService.signUp(
                registerDTO.getEmail(),
                registerDTO.getPassword(),
                registerDTO.getFirstName(),
                registerDTO.getLastName()
            );

            if (!supabaseResult.isSuccess()) {
            return AuthResponse.builder()
                .success(false)
                .message("Registration failed in database auth module")
                .build();
            }
        }
        
        RegisterEntity registerEntity = convertToEntity(registerDTO);
        registerEntity.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        registerEntity.setRole("CUSTOMER");
        // Hash password with BCrypt
        registerEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        
        RegisterEntity savedEntity = registerRepository.save(registerEntity);
        
        String accessToken;
        String refreshToken;
        long expiresIn;

        if (supabaseResult != null && supabaseResult.isSuccess()) {
            accessToken = supabaseResult.getAccessToken();
            refreshToken = supabaseResult.getRefreshToken();
            expiresIn = supabaseResult.getExpiresIn();
        } else {
            accessToken = jwtTokenProvider.generateAccessToken(savedEntity.getId(), savedEntity.getEmail(), savedEntity.getRole());
            refreshToken = jwtTokenProvider.generateRefreshToken(savedEntity.getId(), savedEntity.getEmail());
            expiresIn = jwtTokenProvider.getExpirationTime();
        }
        
        return AuthResponse.builder()
                .success(true)
                .message("Registration successful")
                .user(convertToUserInfo(savedEntity))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(expiresIn)
                .build();
    }
    
    public RegisterDTO findByEmail(String email) {
        Optional<RegisterEntity> user = registerRepository.findByEmail(email);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    public RegisterDTO findById(Long id) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    public RegisterDTO updateUser(Long id, RegisterDTO registerDTO) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        
        if (user.isPresent()) {
            RegisterEntity registerEntity = user.get();
            registerEntity.setFirstName(registerDTO.getFirstName());
            registerEntity.setLastName(registerDTO.getLastName());
            
            RegisterEntity savedEntity = registerRepository.save(registerEntity);
            return convertToDTO(savedEntity);
        }
        
        return null;
    }
    
    public RegisterDTO updateUserProfile(Long id, UpdateProfileDTO updateProfileDTO) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        
        if (user.isPresent()) {
            RegisterEntity registerEntity = user.get();
            registerEntity.setFirstName(updateProfileDTO.getFirstName());
            registerEntity.setLastName(updateProfileDTO.getLastName());
            
            RegisterEntity savedEntity = registerRepository.save(registerEntity);
            return convertToDTO(savedEntity);
        }
        
        return null;
    }
    
    private RegisterDTO convertToDTO(RegisterEntity registerEntity) {
        RegisterDTO dto = new RegisterDTO(
            registerEntity.getFirstName(),
            registerEntity.getLastName(),
            registerEntity.getEmail(),
            registerEntity.getPassword(),
            registerEntity.getId(),
            registerEntity.getCreatedAt(),
            null, // photoData - don't include in DTO
            registerEntity.getPhotoFilename(),
            registerEntity.getPhotoMimeType()
        );
        return dto;
    }

    private UserInfo convertToUserInfo(RegisterEntity registerEntity) {
        return UserInfo.builder()
                .id(registerEntity.getId())
                .email(registerEntity.getEmail())
                .firstName(registerEntity.getFirstName())
                .lastName(registerEntity.getLastName())
                .fullName(registerEntity.getFirstName() + " " + registerEntity.getLastName())
                .role(registerEntity.getRole() == null || registerEntity.getRole().isBlank() ? "CUSTOMER" : registerEntity.getRole())
                .createdAt(registerEntity.getCreatedAt())
                .build();
    }
    
    private RegisterEntity convertToEntity(RegisterDTO registerDTO) {
        RegisterEntity entity = new RegisterEntity();
        entity.setFirstName(registerDTO.getFirstName());
        entity.setLastName(registerDTO.getLastName());
        entity.setEmail(registerDTO.getEmail());
        entity.setPassword(registerDTO.getPassword());
        entity.setRole("CUSTOMER");
        entity.setCreatedAt(null);
        return entity;
    }
    
    public boolean changePassword(Long id, String currentPassword, String newPassword) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        
        if (user.isPresent()) {
            RegisterEntity registerEntity = user.get();
            
            // Verify current password
            if (passwordEncoder.matches(currentPassword, registerEntity.getPassword())) {
                // Update with new password
                registerEntity.setPassword(passwordEncoder.encode(newPassword));
                registerRepository.save(registerEntity);
                return true;
            }
        }
        
        return false;
    }
    
    public boolean uploadPhoto(Long id, byte[] photoData, String filename, String mimeType) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        
        if (user.isPresent()) {
            RegisterEntity registerEntity = user.get();
            registerEntity.setPhotoData(photoData);
            registerEntity.setPhotoFilename(filename);
            registerEntity.setPhotoMimeType(mimeType);
            registerRepository.save(registerEntity);
            return true;
        }
        
        return false;
    }
    
    public byte[] getPhoto(Long id) {
        Optional<RegisterEntity> user = registerRepository.findById(id);
        
        if (user.isPresent()) {
            return user.get().getPhotoData();
        }
        
        return null;
    }
}
