import { useEffect, useState } from 'react';
import BannerItemView from '../BannerItem';
import { BannerItem } from '@/types/user/interface';
import './style.css';

interface BannerSliderProps {
    banners: BannerItem[];
}

export default function BannerMain({ banners }: BannerSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const total = banners.length;

    useEffect(() => {
        if (total <= 1) {
            return;
        }

        const id = window.setInterval(() => {
            setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
        }, 10_000);

        return () => {
            window.clearInterval(id);
        };
    }, [total]);

    if (total > 0 && currentIndex > total - 1) {
        setCurrentIndex(0);
    }

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    };

    return (
        <div className="banner-container">
            {total > 1 && (
                <button className="banner-nav prev" onClick={handlePrev}>
                    ‹
                </button>
            )}

            <div className="banner-wrapper">
                {total === 0 ?
                    <div className='banner-trank'> 배너 x </div>
                :
                    <div
                        className="banner-track"
                        style={{
                            width: `${total * 100}%`,
                            transform: `translateX(-${currentIndex * (100 / total)}%)`,
                        }}
                    >
                        {banners.map(banner => (
                            <div
                                key={banner.bannerId}
                                className="banner-slide"
                                style={{ flex: `0 0 ${100 / total}%` }}
                            >
                                <BannerItemView banner={banner} />
                            </div>
                        ))}
                    </div>
                }
            </div>

            {total > 1 && (
                <button className="banner-nav next" onClick={handleNext}>
                    ›
                </button>
            )}
        </div>
    );
}