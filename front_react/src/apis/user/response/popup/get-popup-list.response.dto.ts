import type { PopupListItem } from "@/types/user/interface";


export default interface GetPopupListResponseDto {
    popupList: PopupListItem[];
}

//팝업리스트로 받아와야 여러개의 팝업리스트를 가져올 수 있음.