import { useState } from 'react';
import BannerItemView from '../BannerItem';
import { BannerItem } from '@/types/user/interface';
import './style.css';

interface BannerSliderProps {
    banners: BannerItem[];
}

export default function BannerMain({ banners }: BannerSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const total = banners.length;

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    };

    return (
        <div className="banner-container">
            <button className="banner-nav prev" onClick={handlePrev}>
                ‹
            </button>

            <div className="banner-wrapper">
                {total === 0 ?
                    <div className='banner-trank'> 배너 x </div>
                :
                    <div
                        className="banner-track"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {banners.map(banner => (
                            <BannerItemView key={banner.bannerId} banner={banner} />
                        ))}
                    </div>
                }
            </div>

            <button className="banner-nav next" onClick={handleNext}>
                ›
            </button>
        </div>
    );
}