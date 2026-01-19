export default interface GetProductListRequestDto {
    page: number | string;
    size: number | string;
    categoryId: number | string | null;
    keyword: string | null;
    sort: string;
}