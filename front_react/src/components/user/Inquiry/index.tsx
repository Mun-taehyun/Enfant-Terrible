import { useLoginUserStore } from "@/stores/user";
import { InquiryItem } from "@/types/user/interface";
import { useState } from "react";
import './style.css';


interface Props {
    item : InquiryItem;
}


export default function InquiryBox ({item} : Props) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
  
    const formatDate = (date: string) => date.split('T')[0].replace(/-/g, '.');
    const { loginUser } = useLoginUserStore();
    const isMyInquiry = loginUser?.email === item.userEmail;

  
  // 권한 체크: 비밀글이 아니거나, 당사자이거나, 관리자일 때
  const hasPermission = !item.isPrivate || isMyInquiry;
  // 답변 완료 여부: 답변 내용이 있으면 완료로 간주
  const isAnswered = !!item.answerContent;

  return (
    <div className="inquiry-item-container">
      {/* 헤더: 권한에 따라 클릭 가능 여부와 스타일 결정 */}
      <div 
        className={`inquiry-header ${!hasPermission ? 'no-permission' : ''} ${isOpen ? 'active' : ''}`}
        onClick={() => hasPermission && setIsOpen(!isOpen)}
      >
        <div className="inquiry-left-box">
          <div className="inquiry-summary-row">
            {item.isPrivate && <div className="icon-private">🔒</div>}
            <div className="summary-text">
              {hasPermission ? item.content : "비밀글입니다."}
            </div>
            {isAnswered && <div className="answer-complete-tag">답변완료</div>}
          </div>
        </div>
        
        <div className="inquiry-right-box">
          <div className="user-info">{item.userEmail}</div>
          <div className="date-info">{formatDate(item.createdAt)}</div>
        </div>
      </div>

      {/* 본문: 권한이 있고 활성화된 상태에서만 렌더링 */}
      {isOpen && hasPermission && (
        <div className="inquiry-body-content">
          <div className="question-wrapper">
            <div className="question-text">{item.content}</div>
            {item.imageUrls.length > 0 && (
              <div className="image-grid">
                {item.imageUrls.map((url, idx) => (
                  <div key={idx} className="img-box">
                    <img src={url} alt="문의 이미지" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {isAnswered && (
            <div className="answer-wrapper">
              <div className="answer-top">
                <div className="admin-label">관리자 답변</div>
                <div className="answer-date">{formatDate(item.answeredAt!)}</div>
              </div>
              <div className="answer-text">{item.answerContent}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
