package com.sysintegg7.abatayo.wildcatslounge.LoginPage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginRepository extends JpaRepository<LoginEntity, Long> {
    Optional<LoginEntity> findByEmail(String email);
}
