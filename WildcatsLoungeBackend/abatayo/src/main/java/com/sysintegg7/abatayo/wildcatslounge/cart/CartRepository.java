package com.sysintegg7.abatayo.wildcatslounge.cart;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {
    Optional<CartEntity> findByUser(RegisterEntity user);
}
