package com.sysintegg7.abatayo.wildcatslounge.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordResponse {
    private boolean success;
    private String message;
}
