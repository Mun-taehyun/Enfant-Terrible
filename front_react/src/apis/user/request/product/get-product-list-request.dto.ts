export default interface GetProductListRequestDto {
    page: number;
    size: number;
    categoryId: number | null;
    keyword: string | null;
    sort: "RECENT" | "PRICE_ASC" | "PRICE_DESC" | "NAME";
}