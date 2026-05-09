package com.sysintegg7.abatayo.wildcatslounge.auth;

import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetTokenRepository tokenRepository;
    private final RegisterRepository registerRepository;
    private final SendGridEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token-expiration-minutes:30}")
    private long tokenExpirationMinutes;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                              RegisterRepository registerRepository,
                              SendGridEmailService emailService,
                              PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.registerRepository = registerRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean sendPasswordResetEmail(String email) {
        Optional<RegisterEntity> userOpt = registerRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists (security best practice)
            return true;
        }

        RegisterEntity user = userOpt.get();
        String token = UUID.randomUUID().toString();
        long expiresAt = System.currentTimeMillis() + (tokenExpirationMinutes * 60 * 1000);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);
        resetToken.setCreatedAt(String.valueOf(System.currentTimeMillis()));

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        sendEmail(email, user.getFirstName(), resetLink);

        return true;
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByToken(token);

        if (resetTokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = resetTokenOpt.get();

        if (resetToken.getUsed()) {
            return false;
        }

        if (resetToken.isExpired()) {
            return false;
        }

        Optional<RegisterEntity> userOpt = registerRepository.findByEmail(resetToken.getEmail());
        if (userOpt.isEmpty()) {
            return false;
        }

        RegisterEntity user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        registerRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return true;
    }

    public boolean validateToken(String token) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByToken(token);

        if (resetTokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = resetTokenOpt.get();
        return !resetToken.getUsed() && !resetToken.isExpired();
    }

    @Async
    private void sendEmail(String email, String firstName, String resetLink) {
        try {
            logger.info("Attempting to send password reset email to: {}", email);
            
            String subject = "Password Reset Request - Wildcats Lounge";
            String htmlContent = "<html><body>" +
                    "<p>Hi " + firstName + ",</p>" +
                    "<p>We received a request to reset your password. Click the link below to set a new password:</p>" +
                    "<p><a href=\"" + resetLink + "\">Reset Password</a></p>" +
                    "<p>Or copy and paste this link: " + resetLink + "</p>" +
                    "<p>This link will expire in " + tokenExpirationMinutes + " minutes.</p>" +
                    "<p>If you didn't request this, please ignore this email.</p>" +
                    "<p>Best regards,<br/>Wildcats Lounge Team</p>" +
                    "</body></html>";
            
            emailService.sendEmail(email, subject, htmlContent);
            logger.info("Password reset email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", email, e.getMessage(), e);
        }
    }
}
