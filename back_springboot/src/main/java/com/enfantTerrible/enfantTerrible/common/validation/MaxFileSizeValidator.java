package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MaxFileSizeValidator implements ConstraintValidator<MaxFileSize, Long> {

    private long maxSize;

    @Override
    public void initialize(MaxFileSize constraintAnnotation) {
        this.maxSize = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(Long fileSize, ConstraintValidatorContext context) {
        return fileSize != null && fileSize <= maxSize;
    }
}
