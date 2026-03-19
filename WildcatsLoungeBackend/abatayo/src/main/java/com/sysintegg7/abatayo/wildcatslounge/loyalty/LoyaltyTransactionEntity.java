package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.order.OrderEntity;
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
    @JoinColumn(name = "user_id", nullable = false)
    private RegisterEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private OrderEntity order;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;

    @Column(name = "points_redeemed", nullable = false)
    private Integer pointsRedeemed;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Column(name = "created_at", nullable = false)
    private String createdAt;
}
