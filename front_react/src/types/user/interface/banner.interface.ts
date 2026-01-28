export default interface BannerItem {
    bannerId : number | string;             //배너 pk
    title : string;                         //배너 제목
    linkUrl : string;                       //배너 링크
    sortOrder : number | string;            //배너 순번

    imageUrl : string;                      //배너 이미지 
}