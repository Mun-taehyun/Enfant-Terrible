import { useCallback, useRef, useState } from "react";


// 대분류 소분류 카테고리 크기가 잘리지 않도록 하는 커스텀 훅
export const useDynamicSlide = () => {

    //참조 : 요소를 감싸는 객체 (DOM 참조)
    const containerRef = useRef<HTMLDivElement>(null);

    //속성 : X축 이동값 (왼 or 오)
    const [scrollX, setScrollX] = useState(0);

    //속성 : 오른 쪽 끝 부분 도달 여부 
    const [isEnd, setIsEnd] = useState(false);
    

    //이벤트핸들러 : 배열 요소여부에 따른 함수 재사용 이벤트 처리
    const handleMove = useCallback((direction: 'next' | 'prev') => {
        const container = containerRef.current;
        if (!container) return;
        //dom 업데이트 여부 

        const viewPortWidth = container.parentElement?.offsetWidth || 1200; 
        const totalWidth = container.scrollWidth; 
        //보여지는 창의 너비와   전체 너비를 각각 구분 
        //parentElement => ref 참조 DOM 의 부모 DOM 
        //offsetWidth => 요소의 실제 눈에 보이는 너비 
        //scrollWidth => 요소에 담긴 전체 가로 너비 
        const currentX = Math.abs(scrollX);
        //x 이동을 절댓값으로 계산 => 무조건 +

        // 한 번 이동 시 뷰포트의 80% 만큼 이동 (부드러운 전환)
        const moveAmount = viewPortWidth * 0.8; 

        let nextX = 0;
        if (direction === 'next') nextX = Math.min(currentX + moveAmount, totalWidth - viewPortWidth);
        // 다음으로 갈 시 두 요소 중 최솟값으로 선택 
        else nextX = Math.max(currentX - moveAmount, 0);
        //이전으로 갈 시 최댓값으로 선택 (이동을 못하거나 하거나)
        

        setScrollX(-nextX);
        //이전 , 이후 이동할 값 계산 
        setIsEnd(nextX >= totalWidth - viewPortWidth - 5);
        //끝부분을 한정 짓기 위한 계산 
    }, [scrollX]);


    return { scrollX, handleMove, containerRef, isStart: scrollX === 0, isEnd };
};

