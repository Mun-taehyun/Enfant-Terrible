package com.enfantTerrible.enfantTerrible.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = MaxFileSizeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxFileSize {
    String message() default "파일 크기가 최대 허용 크기를 초과했습니다.";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    long value() default 10485760L; // 기본 10MB
}
