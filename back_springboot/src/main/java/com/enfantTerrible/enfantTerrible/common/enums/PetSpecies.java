package com.enfantTerrible.enfantTerrible.common.enums;

public enum PetSpecies {
    DOG("개", "Dog"),
    CAT("고양이", "Cat"),
    HAMSTER("햄스터", "Hamster"),
    RABBIT("토끼", "Rabbit"),
    BIRD("새", "Bird"),
    FISH("물고기", "Fish"),
    REPTILE("파충류", "Reptile"),
    OTHER("기타", "Other");

    private final String koreanName;
    private final String englishName;

    PetSpecies(String koreanName, String englishName) {
        this.koreanName = koreanName;
        this.englishName = englishName;
    }

    public String getKoreanName() {
        return koreanName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public static PetSpecies from(String value) {
        if (value == null) {
            return OTHER;
        }
        try {
            return PetSpecies.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
