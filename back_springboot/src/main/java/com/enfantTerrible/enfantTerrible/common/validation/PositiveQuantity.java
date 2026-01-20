package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PositiveQuantityValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface PositiveQuantity {
    String message() default "수량은 1 이상이어야 합니다.";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
