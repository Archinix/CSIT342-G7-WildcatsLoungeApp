package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "loyalty_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "points_id", nullable = false)
    private LoyaltyPointsEntity loyaltyPoints;

    @Column(nullable = false)
    private Integer pointsDelta;

    @Column(nullable = false)
    private String transactionType;

    @Column(nullable = false)
    private String note;

    @Column(name = "created_at", nullable = false)
    private String createdAt;
}
