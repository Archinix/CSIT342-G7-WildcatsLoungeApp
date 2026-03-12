package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import com.sysintegg7.abatayo.wildcatslounge.auth.JwtTokenProvider;
import com.sysintegg7.abatayo.wildcatslounge.auth.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService {

    @Autowired
    private RegisterRepository registerRepository;
    
    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse authenticate(LoginDTO loginDTO) {
        Optional<RegisterEntity> user = registerRepository.findByEmail(loginDTO.getEmail());
        
        if (user.isPresent() && passwordEncoder.matches(loginDTO.getPassword(), user.get().getPassword())) {
            RegisterEntity loginEntity = user.get();
            
            // Generate JWT tokens
            String accessToken = jwtTokenProvider.generateAccessToken(
                loginEntity.getId(),
                loginEntity.getEmail(),
                loginEntity.getRole()
            );
            String refreshToken = jwtTokenProvider.generateRefreshToken(loginEntity.getId(), loginEntity.getEmail());
            
            return AuthResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .user(convertToUserInfo(loginEntity))
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .build();
        }
        
        return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password")
                .build();
    }
    
    public LoginDTO findByEmail(String email) {
        Optional<RegisterEntity> user = registerRepository.findByEmail(email);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    public LoginDTO updateLastLogin(Long id) {
        Optional<LoginEntity> user = loginRepository.findById(id);
        
        if (user.isPresent()) {
            LoginEntity loginEntity = user.get();
            loginEntity.setLastLogin(String.valueOf(System.currentTimeMillis()));
            loginRepository.save(loginEntity);
            return convertLegacyToDTO(loginEntity);
        }
        
        return null;
    }
    
    private LoginDTO convertToDTO(RegisterEntity loginEntity) {
        return new LoginDTO(
            loginEntity.getEmail(),
            loginEntity.getPassword(),
            loginEntity.getId(),
            loginEntity.getCreatedAt(),
            null
        );
    }

    private LoginDTO convertLegacyToDTO(LoginEntity loginEntity) {
        return new LoginDTO(
                loginEntity.getEmail(),
                loginEntity.getPassword(),
                loginEntity.getId(),
                loginEntity.getCreatedAt(),
                loginEntity.getLastLogin()
        );
    }

    private UserInfo convertToUserInfo(RegisterEntity loginEntity) {
        return UserInfo.builder()
                .id(loginEntity.getId())
                .email(loginEntity.getEmail())
                .firstName(loginEntity.getFirstName())
                .lastName(loginEntity.getLastName())
                .fullName(loginEntity.getFirstName() + " " + loginEntity.getLastName())
                .role(loginEntity.getRole() == null || loginEntity.getRole().isBlank() ? "CUSTOMER" : loginEntity.getRole())
                .createdAt(loginEntity.getCreatedAt())
                .build();
    }
}
