package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import com.sysintegg7.abatayo.wildcatslounge.auth.JwtTokenProvider;
import com.sysintegg7.abatayo.wildcatslounge.auth.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RegisterService {
    
    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse register(RegisterDTO registerDTO) {
        // Check if email already exists
        if (registerRepository.existsByEmail(registerDTO.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email already registered")
                    .build();
        }
        
        RegisterEntity registerEntity = convertToEntity(registerDTO);
        registerEntity.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        registerEntity.setRole("CUSTOMER");
        // Hash password with BCrypt
        registerEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        
        RegisterEntity savedEntity = registerRepository.save(registerEntity);
        
        // Generate JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(savedEntity.getId(), savedEntity.getEmail(), savedEntity.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedEntity.getId(), savedEntity.getEmail());
        
        return AuthResponse.builder()
                .success(true)
                .message("Registration successful")
                .user(convertToUserInfo(savedEntity))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getExpirationTime())
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
    
    private RegisterDTO convertToDTO(RegisterEntity registerEntity) {
        return new RegisterDTO(
            registerEntity.getFirstName(),
            registerEntity.getLastName(),
            registerEntity.getEmail(),
            registerEntity.getPassword(),
            registerEntity.getId(),
            registerEntity.getCreatedAt()
        );
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
}
