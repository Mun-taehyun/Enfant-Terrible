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

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    };

    // --- 추가: 3초 자동 슬라이드 로직 ---
    useEffect(() => {
        if (total === 0) return;

        const timer = setInterval(() => {
            handleNext();
        }, 3000); // 3000ms = 3초

        return () => clearInterval(timer); // 컴포넌트 언마운트나 인덱스 변경 시 정리
    }, [currentIndex, total]); // 인덱스가 바뀔 때마다 타이머를 새로 설정해 꼬임 방지

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