import { OptionGroup } from "@/types/user/interface";
import OptionSku from "@/types/user/interface/option-sku.interface";

export default interface GetProductDetailListResponseDto {
    productId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    desciption: string;

    discountType: string;
    discountValue: number;
    averageRating: number;
    reviewCount: number;

    thumbnailUrl: string;
    contentImageUrls: string[];

    optionGroups: OptionGroup[];

    skus: OptionSku[];
}
//상품 상세조회 