import { PostItem } from "@/apis/user/response/post/post-response.dto";
import './style.css'

interface PostItemProps {
  post: PostItem;
}

export default function PostComponent({ post }: PostItemProps) {
  const { postType, title, content, fileUrls, createdAt } = post;
  
  // 공지사항 여부 판단
  const isNotice = postType === 'NOTICE';

  return (
    <div className={`post-item-container ${isNotice ? 'notice-row' : ''}`}>
      <div className="post-info-section">
        <div className="post-top-meta">
          {isNotice && <span className="label-notice">공지</span>}
          <span className="text-date">{createdAt.split('T')[0]}</span>
        </div>
        
        <div className="post-main-content">
          <h3 className="text-title">{title}</h3>
          <p className="text-preview">{content}</p>
        </div>

        {fileUrls && fileUrls.length > 0 && (
          <div className="post-attachment-info">
            <span className="icon-clip">📎</span>
            <span className="text-file-count">첨부파일 {fileUrls.length}</span>
          </div>
        )}
      </div>
      
      <div className="post-action-indicator">
        <i className="arrow-icon"></i>
      </div>
    </div>
  );
}