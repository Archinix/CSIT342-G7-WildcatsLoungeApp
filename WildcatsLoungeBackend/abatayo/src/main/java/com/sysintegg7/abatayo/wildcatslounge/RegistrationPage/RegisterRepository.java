package com.sysintegg7.abatayo.wildcatslounge.RegistrationPage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegisterRepository extends JpaRepository<RegisterEntity, Long> {
    Optional<RegisterEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
