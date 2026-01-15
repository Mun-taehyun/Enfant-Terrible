import { useCallback, useRef, useState } from "react";


// 대분류 소분류 카테고리 크기가 잘리지 않도록 하는 커스텀 훅
export const useDynamicSlide = () => {
    const [scrollX, setScrollX] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 가장 왼쪽에 있는 아이템 인덱스
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((direction: 'next' | 'prev') => {
        const container = containerRef.current;
        if (!container) return;

        const children = Array.from(container.children) as HTMLElement[];
        if (children.length === 0) return;

        let nextIndex = currentIndex;
        if (direction === 'next') {
            nextIndex = Math.min(currentIndex + 1, children.length - 1);
        } else {
            nextIndex = Math.max(currentIndex - 1, 0);
        }

        // 핵심 로직: 0번부터 nextIndex 바로 전까지의 모든 자식 너비를 합산함
        // 그 합산만큼 마이너스(-) 방향으로 밀어내면 정확히 해당 아이템이 시작점에 위치함
        const offset = children
            .slice(0, nextIndex)
            .reduce((acc, child) => acc + child.offsetWidth, 0);

        setScrollX(-offset);
        setCurrentIndex(nextIndex);
    }, [currentIndex]);

    return { scrollX, handleMove, containerRef, currentIndex };
};