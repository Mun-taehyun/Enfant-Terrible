import './style.css';


interface WidgetHomeProps {
  onStartChat: () => void;
}

export default function ChatWait({ onStartChat }: WidgetHomeProps) {
return (
    <div className="widget-home-container">
      {/* 상단 배너: 부모의 x 버튼 위치를 고려해 패딩 처리 */}
      <div className="seller-banner">
        <div className="banner-content">
          <div className="seller-title">반려용품 판매점 - 앙팡테리블</div>
          <div className="seller-subtitle">⚡ 24시간 판매자와 소통해요</div>
        </div>
      </div>

      {/* 중앙 섹션: 부모 360px 내부에 꽉 차게 배치 */}
      <div className="cta-section">
        <div className="info-card">
          <div className="info-text">안녕하세요! 앙팡테리블입니다. 😊</div>
          <div className="info-text">궁금한 점이 있으신가요?</div>
        </div>
        
        <div className="button-wrapper">
          <button className="start-chat-btn" onClick={onStartChat}>
            판매자와 채팅하러 가기 ✈️
          </button>
        </div>
        
        <div className="status-indicator">
          <span className="dot">●</span> 판매자에게 답변을 받을 수 있어요
        </div>
      </div>
    </div>
  );
}