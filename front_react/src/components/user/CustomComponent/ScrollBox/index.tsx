import './style.css';
import { forwardRef, useEffect, useMemo, useRef } from "react";

interface Props {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit: string;
}
//이름 , 값 , 바꾸는이벤트 , 최대최솟값 , 개수.kg 등.. 



export const ScrollBox = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
    const { label, value, onChange, min, max, unit } = props;
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false); // 사용자가 직접 스크롤 중인지 확인용
    const itemWidth = 40;

    const scrollValue = useMemo(() => {
        const values = [];
        for (let i = min; i <= max; i += 0.5) {
            values.push(Number(i.toFixed(1)));
        }
        return values;
    }, [min, max]);

    // 1. 초기 렌더링 시 딱 한 번만 value 위치로 스크롤 이동
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            const index = scrollValue.indexOf(Number(value.toFixed(1)));
            if (index !== -1) {
                container.scrollLeft = index * itemWidth;
            }
        }
        // 초기 1회 실행을 의도함 (의존성 경고는 주석으로 해결하거나 로직 분리)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleScroll = () => {
        if (!scrollRef.current) return;
        
        // 사용자가 스크롤 중임을 표시 (무한 루프 방지용)
        isScrolling.current = true;
        
        const container = scrollRef.current;
        const index = Math.round(container.scrollLeft / itemWidth);
        const selectedValue = scrollValue[Math.max(0, Math.min(index, scrollValue.length - 1))];

        if (selectedValue !== undefined && selectedValue !== value) {
            onChange(selectedValue);
        }
        
        // 스크롤 종료 후 플래그 해제 (setTimeout 등으로 지연 가능)
        isScrolling.current = false;
    };

    return (
        <div className="common-form-group" ref={ref}>
            <div className="carousel-header">
                <div className="common-form-label">{label}</div>
                <div className="current-weight-display">
                    {/* 소수점 오차 방지를 위해 toFixed(1) */}
                    <span className="weight-num">{Number(value).toFixed(1)}</span>
                    <span className="weight-unit">{unit}</span>
                </div>
            </div>
            
            <div className="weight-carousel-outer">
                <div className="weight-center-indicator"></div>
                <div className="weight-scroll-box" ref={scrollRef} onScroll={handleScroll}>
                    <div className="weight-spacer"></div>
                    {scrollValue.map((num) => (
                        <div key={num} className="weight-tick-item">
                            <div className={`tick-line ${Number.isInteger(num) ? 'long' : 'medium'}`}></div>
                            {Number.isInteger(num) && <span className="tick-number">{num}</span>}
                        </div>
                    ))}
                    <div className="weight-spacer"></div>
                </div>
            </div>
        </div>
    );
});