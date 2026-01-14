import './style.css';

//컴포넌트 : 카테고리 리스트 
export default function CategoryItemList(){



    return (
        <>
        <div className="pet-nav-container">
            <div className="main-menu-group">
                <div className="menu-item" data-cate="dog">강아지</div>
                <div className="menu-item" data-cate="cat">고양이</div>
                <div className="menu-item" data-cate="health">영양제</div>
                <div className="menu-item" data-cate="event">이벤트/기획전</div>
            </div>

            <div className="sub-menu-panel">
                <div className="sub-menu-content">
                <div className="sub-column">
                    <div className="column-title">강아지 사료</div>
                    <div className="sub-item">건식 사료</div>
                    <div className="sub-item">습식/캔</div>
                    <div className="sub-item">수제 사료</div>
                </div>
                <div className="sub-column">
                    <div className="column-title">고양이 간식</div>
                    <div className="sub-item">츄르/스틱</div>
                    <div className="sub-item">동결건조</div>
                    <div className="sub-item">캣잎/드롭스</div>
                </div>
                <div className="sub-column">
                    <div className="column-title">기능별 영양제</div>
                    <div className="sub-item">관절/뼈</div>
                    <div className="sub-item">피부/피모</div>
                    <div className="sub-item">눈/눈물</div>
                </div>
                <div className="sub-column-promo">
                    <div className="promo-box">
                    🐾 이번 주 <span className="highlight">멍냥 특가</span> 보러가기
                    </div>
                </div>
                </div>
            </div>
        </div>
        </>
    );

}