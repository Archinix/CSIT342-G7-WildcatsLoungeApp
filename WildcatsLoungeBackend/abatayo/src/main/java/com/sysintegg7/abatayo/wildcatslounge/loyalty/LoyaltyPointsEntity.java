package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "loyalty_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPointsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private RegisterEntity user;

    @Column(nullable = false)
    private Integer points;
}
