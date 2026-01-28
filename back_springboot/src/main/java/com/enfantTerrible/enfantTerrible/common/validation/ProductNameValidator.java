package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ProductNameValidator implements ConstraintValidator<ProductName, String> {

    @Override
    public boolean isValid(String productName, ConstraintValidatorContext context) {
        if (productName == null) {
            return false;
        }
        
        String trimmed = productName.trim();
        return trimmed.length() >= 2 && trimmed.length() <= 100;
    }
}
