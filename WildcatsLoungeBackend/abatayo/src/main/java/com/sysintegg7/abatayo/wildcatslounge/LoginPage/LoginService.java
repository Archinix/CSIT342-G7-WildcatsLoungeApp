package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

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
    private LoginRepository loginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse authenticate(LoginDTO loginDTO) {
        Optional<LoginEntity> user = loginRepository.findByEmail(loginDTO.getEmail());
        
        if (user.isPresent() && passwordEncoder.matches(loginDTO.getPassword(), user.get().getPassword())) {
            LoginEntity loginEntity = user.get();
            
            // Update last login
            loginEntity.setLastLogin(String.valueOf(System.currentTimeMillis()));
            loginRepository.save(loginEntity);
            
            // Generate JWT tokens
            String accessToken = jwtTokenProvider.generateAccessToken(loginEntity.getId(), loginEntity.getEmail());
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
        Optional<LoginEntity> user = loginRepository.findByEmail(email);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    public LoginDTO updateLastLogin(Long id) {
        Optional<LoginEntity> user = loginRepository.findById(id);
        
        if (user.isPresent()) {
            LoginEntity loginEntity = user.get();
            loginEntity.setLastLogin(String.valueOf(System.currentTimeMillis()));
            loginRepository.save(loginEntity);
            return convertToDTO(loginEntity);
        }
        
        return null;
    }
    
    private LoginDTO convertToDTO(LoginEntity loginEntity) {
        return new LoginDTO(
            loginEntity.getEmail(),
            loginEntity.getPassword(),
            loginEntity.getId(),
            loginEntity.getCreatedAt(),
            loginEntity.getLastLogin()
        );
    }

    private UserInfo convertToUserInfo(LoginEntity loginEntity) {
        return UserInfo.builder()
                .id(loginEntity.getId())
                .email(loginEntity.getEmail())
                .role("CUSTOMER")
                .createdAt(loginEntity.getCreatedAt())
                .build();
    }
}
