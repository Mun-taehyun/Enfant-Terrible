package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;

public class ValidFileTypeValidator implements ConstraintValidator<ValidFileType, String> {

    private String[] allowedTypes;

    @Override
    public void initialize(ValidFileType constraintAnnotation) {
        this.allowedTypes = constraintAnnotation.allowedTypes();
    }

    @Override
    public boolean isValid(String fileType, ConstraintValidatorContext context) {
        if (fileType == null) {
            return false;
        }
        
        return Arrays.asList(allowedTypes).contains(fileType.toLowerCase());
    }
}
