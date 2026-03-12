package com.sysintegg7.abatayo.wildcatslounge.order;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserOrderByIdDesc(RegisterEntity user);
    List<OrderEntity> findByStatus(String status);
}
