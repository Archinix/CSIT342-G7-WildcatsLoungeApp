package com.sysintegg7.abatayo.wildcatslounge.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private boolean available;
    private String imageUrl;
}
