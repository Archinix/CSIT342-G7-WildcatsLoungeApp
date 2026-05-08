package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long id;
    private String code;
    private Integer discountAmount;
    private Integer pointsCost;
    private boolean isUsed;
    private String expiryDate;
}
