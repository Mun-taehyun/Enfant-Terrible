import { BannerItem } from "@/types/user/interface";
import './style.css';
interface BannerItemViewProps {
    banner: BannerItem;
}



export default function BannerItemView({ banner }: BannerItemViewProps) {

    const apiBaseRaw = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
    const apiOrigin = apiBaseRaw
        ? apiBaseRaw.replace(/\/+$/, '').replace(/\/api$/, '')
        : window.location.origin;

    const raw = (banner.imageUrl ?? '').trim();
    const fullImageUrl = raw
        ? (raw.startsWith('http')
            ? raw
            : raw.startsWith('/')
                ? `${apiOrigin}${raw}`
                : `${apiOrigin}/${raw}`)
        : "";


    return (
        <a
            href={banner.linkUrl}
            className="banner-item"
        >
            {fullImageUrl && (
                <img
                    className="banner-img"
                    src={fullImageUrl}
                    alt=""
                />
            )}
        </a>
    );
}