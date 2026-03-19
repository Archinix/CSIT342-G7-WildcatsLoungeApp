package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransactionEntity, Long> {
    List<LoyaltyTransactionEntity> findByUserOrderByIdDesc(RegisterEntity user);
}
