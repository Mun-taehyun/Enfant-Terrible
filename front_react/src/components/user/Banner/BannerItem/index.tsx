import { BannerItem } from "@/types/user/interface";

interface BannerItemViewProps {
    banner: BannerItem;
}

export default function BannerItemView({ banner }: BannerItemViewProps) {
    return (
        <a
            href={banner.linkUrl}
            className="banner-item"
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
        >
            <div className="banner-overlay">
                <h3 className="banner-title">{banner.title}</h3>
            </div>
        </a>
    );
}