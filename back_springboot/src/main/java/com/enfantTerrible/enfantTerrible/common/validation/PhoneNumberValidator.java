package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    private static final String PHONE_PATTERN = 
        "^01([0|1[6-9])-?([0-9]{3,4})-?([0-9]{4})$";

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null) {
            return false;
        }
        
        return Pattern.matches(PHONE_PATTERN, phoneNumber);
    }
}
