package com.sysintegg7.abatayo.wildcatslounge.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupabaseAuthResult {
    private boolean configured;
    private boolean success;
    private String message;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
}