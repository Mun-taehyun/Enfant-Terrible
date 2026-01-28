package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PositivePriceValidator implements ConstraintValidator<PositivePrice, Long> {

    @Override
    public boolean isValid(Long price, ConstraintValidatorContext context) {
        return price != null && price > 0;
    }
}
