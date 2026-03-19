package com.sysintegg7.abatayo.wildcatslounge.order;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private RegisterEntity user;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "created_at", nullable = false)
    private String createdAt;
}
