package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.auth.AuthResponse;
import com.sysintegg7.abatayo.wildcatslounge.auth.JwtTokenProvider;
import com.sysintegg7.abatayo.wildcatslounge.auth.SupabaseAuthResult;
import com.sysintegg7.abatayo.wildcatslounge.auth.SupabaseAuthService;
import com.sysintegg7.abatayo.wildcatslounge.auth.UserInfo;

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

    @Autowired
    private SupabaseAuthService supabaseAuthService;
    
    public AuthResponse authenticate(LoginDTO loginDTO) {
        Optional<RegisterEntity> user = registerRepository.findByEmail(loginDTO.getEmail());

        if (user.isEmpty() || !passwordEncoder.matches(loginDTO.getPassword(), user.get().getPassword())) {
            return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password")
                .build();
        }

        RegisterEntity loginEntity = user.get();

        if (supabaseAuthService.isConfigured()) {
            SupabaseAuthResult supabaseResult = supabaseAuthService.signIn(loginDTO.getEmail(), loginDTO.getPassword());
            if (!supabaseResult.isSuccess()) {
            return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password")
                .build();
            }

            return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .user(convertToUserInfo(loginEntity))
                .accessToken(supabaseResult.getAccessToken())
                .refreshToken(supabaseResult.getRefreshToken())
                .expiresIn(supabaseResult.getExpiresIn())
                .build();
        }

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
