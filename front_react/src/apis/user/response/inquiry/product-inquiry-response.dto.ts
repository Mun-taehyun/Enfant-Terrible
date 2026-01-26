import { InquiryItem } from "@/types/user/interface";

export default interface ProductInquiryResponseDto extends InquiryItem {
    inquiryList : InquiryItem[];
}