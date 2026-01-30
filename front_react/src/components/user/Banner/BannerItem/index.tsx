import { BannerItem } from "@/types/user/interface";
import './style.css';
interface BannerItemViewProps {
    banner: BannerItem;
}



export default function BannerItemView({ banner }: BannerItemViewProps) {

    // 이미지 경로에 서버 주소가 없다면 `${process.env.REACT_APP_API_URL}${imageUrl}` 형태로 수정 필요
    const fullImageUrl = banner.imageUrl && banner.imageUrl.startsWith('http') 
        ? banner.imageUrl 
        : banner.imageUrl 
            ? `http://localhost:8080${banner.imageUrl}` 
            : ""; // 이미지가 아예 없으면 빈 문자열 처리


    return (
        <a
            href={banner.linkUrl}
            className="banner-item"
            style={{ backgroundImage: `url(${fullImageUrl})` }}
        >
            <div className="banner-overlay">
                <h3 className="banner-title">{banner.title}</h3>
            </div>
        </a>
    );
}