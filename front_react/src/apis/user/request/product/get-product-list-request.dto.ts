export default interface GetProductListRequestDto {
    page?: number | string;
    size?: number | string;
    categoryId?: number | string;

    minPrice?: number | string;
    maxPrice?: number | string;
    minRating?: number | string;
    hasDiscount?: boolean | string;

    keyword?: string;
    sort: string;
}