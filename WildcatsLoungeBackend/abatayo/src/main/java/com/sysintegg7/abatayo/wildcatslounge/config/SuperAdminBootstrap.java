package com.sysintegg7.abatayo.wildcatslounge.config;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminBootstrap implements CommandLineRunner {

    private final RegisterRepository registerRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminBootstrap(RegisterRepository registerRepository, PasswordEncoder passwordEncoder) {
        this.registerRepository = registerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        final String superAdminEmail = "superadmin@wildcatslounge.local";
        final String superAdminPassword = "SuperAdmin@123";

        if (registerRepository.existsByEmail(superAdminEmail)) {
            return;
        }

        RegisterEntity superAdmin = new RegisterEntity();
        superAdmin.setFirstName("Super");
        superAdmin.setLastName("Admin");
        superAdmin.setEmail(superAdminEmail);
        superAdmin.setPassword(passwordEncoder.encode(superAdminPassword));
        superAdmin.setRole("SUPERADMIN");
        superAdmin.setCreatedAt(String.valueOf(System.currentTimeMillis()));

        registerRepository.save(superAdmin);
    }
}
