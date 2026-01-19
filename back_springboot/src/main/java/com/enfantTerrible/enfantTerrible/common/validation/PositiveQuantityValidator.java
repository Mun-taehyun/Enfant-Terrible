package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PositiveQuantityValidator implements ConstraintValidator<PositiveQuantity, Integer> {

    @Override
    public boolean isValid(Integer quantity, ConstraintValidatorContext context) {
        return quantity != null && quantity > 0;
    }
}
