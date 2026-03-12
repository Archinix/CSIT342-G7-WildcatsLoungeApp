package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionDTO {
    private Integer pointsDelta;
    private String transactionType;
    private String note;
    private String createdAt;
}
