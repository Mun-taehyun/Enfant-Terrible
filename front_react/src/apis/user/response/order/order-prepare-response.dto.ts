export default interface OrderPrepareResponseDto {
    userId: number;
    receiverName: string;
    receiverPhone: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string|null;
    totalAmount: number;
    items: OrderPrepareItem[];
}

export interface OrderPrepareItem {
    skuId: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    thumbnailUrl: string;
    optionValueIds: number[];
    isBuyable: boolean;
    buyableReason: string|null;
}