package com.enfantTerrible.enfantTerrible.common.enums;

public enum FileRole {
    THUMBNAIL("THUMBNAIL", "썸네일"),
    CONTENT("CONTENT", "본문 이미지"),
    PROFILE("PROFILE", "프로필 이미지"),
    ATTACHMENT("ATTACHMENT", "첨부 파일");

    private final String code;
    private final String description;

    FileRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static FileRole fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (FileRole role : values()) {
            if (role.code.equals(code)) {
                return role;
            }
        }
        return null;
    }

    public static FileRole from(String value) {
        return fromCode(value);
    }
}
