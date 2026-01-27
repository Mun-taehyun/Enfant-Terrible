import type { Pet } from "@/types/user/interface";

export default interface PetSelectResponseDto {
    petList : Pet[];
}// 펫 리스트 조회 