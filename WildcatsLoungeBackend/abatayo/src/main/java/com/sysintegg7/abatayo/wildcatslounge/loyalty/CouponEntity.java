package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private RegisterEntity user;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "discount_amount", nullable = false)
    private Integer discountAmount;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

    @Column(name = "expiry_date", nullable = false)
    private String expiryDate;
}
