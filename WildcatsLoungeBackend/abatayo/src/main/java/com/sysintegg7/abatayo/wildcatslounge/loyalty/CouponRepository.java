package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;

@Repository
public interface CouponRepository extends JpaRepository<CouponEntity, Long> {
    List<CouponEntity> findByUserAndIsUsedFalse(RegisterEntity user);
    List<CouponEntity> findByUser(RegisterEntity user);
    Optional<CouponEntity> findByCode(String code);
    List<CouponEntity> findByUserOrderByIdDesc(RegisterEntity user);
}
