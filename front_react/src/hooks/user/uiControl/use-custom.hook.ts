import { useCallback, useLayoutEffect, useRef, useState } from "react";


// 대분류 소분류 카테고리 크기가 잘리지 않도록 하는 커스텀 훅
export const useDynamicSlide = <T>(deps: T[] = []) => {

    //참조 : 요소를 감싸는 객체 (DOM 참조)
    const containerRef = useRef<HTMLDivElement>(null);

    //상태 : X축 이동값 (왼 or 오)
    const [scrollX, setScrollX] = useState(0);

    //상태 : 오른 쪽 끝 부분 도달 여부 
    const [isEnd, setIsEnd] = useState(false);

    //상태: 스크롤 필요 여부 
    const [canScroll, setCanScroll] = useState(false);

    //상태: 보이는 대분류의 인덱스 여부 
    const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());



    //기억: 스크롤 상태변수 저장(재사용)
    const updateScrollState = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const viewPortWidth = container.parentElement?.offsetWidth || 0;
        const totalWidth = container.scrollWidth;
        //스크롤 조건 전체너비 > 화면너비보다 클 경우 
        setCanScroll(totalWidth > viewPortWidth + 1);

        setIsEnd(Math.abs(scrollX) >= totalWidth - viewPortWidth);
        //절댓값 스크롤 크기 >= 전체크기 - 보이는 크기 => 여백 =< 스크롤크기 
        //끝부분을 판단하기 좋은 척도. 

        if (totalWidth <= viewPortWidth) {setScrollX(0);}
    }, [scrollX]);

    //효과: 인덱스를 인식하며 보이는 지 안 보이는 지 결정
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !container.parentElement) return;

        const observer = new IntersectionObserver(//함수 , 옵션객체
            (entries) => { //감시 중인 전체 요소들의 배열
                setVisibleIndices((prev) => {
                    const next = new Set(prev);
                    entries.forEach((entry : IntersectionObserverEntry) => {
                        //감시 대상의 DOM요소 (data-index)를 체크한다
                        const idx = Number((entry.target as HTMLElement).dataset.index);
                        if(isNaN(idx)) return;
                        //idx가 해당 div에 들어있는 지 여부 data-index 인식 후 집합에서 추가/제거
                        if(entry.isIntersecting) next.add(idx);
                        else next.delete(idx);
                    });
                    return next;
                });
            },
            { root: container.parentElement, threshold: 0.95 } 
            // 시작 기준은 대분류리스트가 있는 부모칸, 95% 이상 보여야 노출
        );

        // 대분류들을 다시 가져와서 변화가 있는 지 체크 
        container.querySelectorAll('.category-large-input-box').forEach(item => observer.observe(item));

        const resizer = new ResizeObserver(() => {updateScrollState();});
        //특정 DOM 요소의 크기 변화(너비/높이)를 감지하는 클래스
        resizer.observe(container);
        //DOM 위치의 변화를 관찰.. 
        if (container.parentElement) resizer.observe(container.parentElement);
        //부모 DOM이 변하면 => 부모dom 관찰 

        // => 부모DOM 자식DOM 변화시 실행 (scrollState)

        return () => {observer.disconnect(); resizer.disconnect();};
        //변화 검증 종료 시 두 감시 옵저버 해제.. 

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateScrollState, ...deps]);

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


    return { scrollX, handleMove, containerRef, isStart: scrollX === 0, isEnd, canScroll, visibleIndices };
};

