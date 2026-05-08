package com.sysintegg7.abatayo.wildcatslounge.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateTokenResponse {
    private boolean valid;
    private String message;
}
