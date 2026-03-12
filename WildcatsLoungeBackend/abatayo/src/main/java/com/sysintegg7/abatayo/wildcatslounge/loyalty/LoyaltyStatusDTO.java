package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyStatusDTO {
    private String userEmail;
    private Integer points;
    private List<LoyaltyTransactionDTO> recentTransactions;
}
