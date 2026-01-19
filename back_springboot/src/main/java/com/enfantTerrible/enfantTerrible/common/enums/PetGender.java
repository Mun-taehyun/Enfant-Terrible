package com.enfantTerrible.enfantTerrible.common.enums;

public enum PetGender {
    MALE("M", "수컷"),
    FEMALE("F", "암컷"),
    UNKNOWN("U", "미확인");

    private final String code;
    private final String description;

    PetGender(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static PetGender fromCode(String code) {
        if (code == null) {
            return UNKNOWN;
        }
        for (PetGender gender : values()) {
            if (gender.code.equals(code)) {
                return gender;
            }
        }
        return UNKNOWN;
    }

    public static PetGender from(String value) {
        return fromCode(value);
    }
}
