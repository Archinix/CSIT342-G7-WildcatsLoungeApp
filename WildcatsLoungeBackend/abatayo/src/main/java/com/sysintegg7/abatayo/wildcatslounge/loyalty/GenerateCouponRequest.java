package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateCouponRequest {
    private Integer pointsToSpend;
}
