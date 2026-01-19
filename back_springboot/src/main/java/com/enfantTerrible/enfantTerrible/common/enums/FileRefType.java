package com.enfantTerrible.enfantTerrible.common.enums;

public enum FileRefType {
    PRODUCT("product", "상품"),
    USER("user", "사용자"),
    ORDER("order", "주문"),
    CATEGORY("category", "카테고리"),
    BANNER("banner", "배너"),
    POPUP("popup", "팝업");

    private final String code;
    private final String description;

    FileRefType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static FileRefType fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (FileRefType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static FileRefType from(String value) {
        return fromCode(value);
    }
}
