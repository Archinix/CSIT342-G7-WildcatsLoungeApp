package com.sysintegg7.abatayo.wildcatslounge.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public void initialize(ValidPassword annotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        // Check all password requirements
        boolean hasMinLength = password.length() >= 8;
        boolean hasUppercase = password.matches(".*[A-Z].*");
        boolean hasLowercase = password.matches(".*[a-z].*");
        boolean hasNumber = password.matches(".*[0-9].*");
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");

        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    }
}
