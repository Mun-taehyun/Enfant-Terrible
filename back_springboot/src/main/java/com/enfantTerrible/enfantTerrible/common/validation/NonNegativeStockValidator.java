package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NonNegativeStockValidator implements ConstraintValidator<NonNegativeStock, Long> {

    @Override
    public boolean isValid(Long stock, ConstraintValidatorContext context) {
        return stock != null && stock >= 0;
    }
}
