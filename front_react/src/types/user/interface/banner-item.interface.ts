export default interface BannerItem {
    bannerId : number | string;
    title : string;
    linkUrl : string;
    position : number | string;
    sortOrder : number | string;
    isActive : boolean;
}