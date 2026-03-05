package com.sysintegg7.abatayo.wildcatslounge.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;
    private String createdAt;
}
