import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';
import { postQueries } from '@/querys/user/queryhooks';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  // 1. 리액트 쿼리 호출 (단건 조회용 훅이라 가정)
  // postId가 있을 때만 활성화되도록 enabled 설정
  const { data : Detailpost, isLoading } = postQueries.useGetPostDetail(Number(postId));
  const post = Detailpost?.postList.find((item) => item.postId === Number(postId));

  if (isLoading) return <div className="pet-detail-loading">🐾 소식을 읽어오는 중...</div>;
  if (!post) return <div className="pet-detail-error">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="pet-detail-wrapper">
      {/* 상단: 카테고리/날짜/제목 */}
      <div className="pet-detail-header">
        <div className="detail-meta-group">
          <div className="detail-tag-notice">공지사항</div>
          <div className="detail-date-text">{post.createdAt.split('T')[0]}</div>
        </div>
        <div className="detail-main-title">{post.title}</div>
      </div>

      {/* 중단: 본문 내용 */}
      <div className="pet-detail-content">
        <div className="content-inner-text">
          {post.content.split('\n').map((line: string, i: number) => (
            <div key={i} className="content-line">{line || <div className="line-break" />}</div>
          ))}
        </div>
      </div>

      {/* 하단: 첨부파일 (파일이 있을 때만 렌더링) */}
      {post.fileUrls && post.fileUrls.length > 0 && (
        <div className="pet-detail-files">
          <div className="file-header">첨부파일 확인</div>
          <div className="file-list">
            {post.fileUrls.map((url: string, index: number) => (
              <div key={index} className="file-item-card" onClick={() => window.open(url)}>
                <div className="file-icon-box">📂</div>
                <div className="file-name-text">첨부파일_{index + 1}</div>
                <div className="file-download-label">보기</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단: 액션 버튼 */}
      <div className="pet-detail-actions">
        <div className="btn-back-to-list" onClick={() => navigate(-1)}>
          목록으로 돌아가기
        </div>
      </div>
    </div>
  );
}