package com.sysintegg7.abatayo.wildcatslounge.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordValidator.class)
@Documented
public @interface ValidPassword {
    String message() default "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
