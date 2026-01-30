import { useState } from 'react';
import './style.css'
import Pagination from '@/components/user/Pagination'; // 님꺼 컴포넌트
import { postQueries } from '@/querys/user/queryhooks';
import { useNavigate } from 'react-router-dom';
import PostComponent from '@/components/user/PostItem';

export default function PostList() {
  // 1. 요청 DTO 상태 (params.postType은 'NOTICE' 고정)
  const [params] = useState({
    page: 1,
    size: 10,
    postType: 'NOTICE'
  });

  //함수 : 네비게이트
  const navigate = useNavigate();



  // 2. 리액트 쿼리 호출
  const { data : postData } = postQueries.useGetPosts(params);



    // 3. 상세 페이지 이동 핸들러
    const handleDetailMove = (postId: number) => {
    // 공지 상세 페이지 경로로 이동 (예: /notice/1)
        navigate(`/post/${postId}`);
    };  

  return (
    <div className="pet-page-container">
      {/* 타이틀 영역 (div 위주) */}
      <div className="pet-page-header">
        <div className="header-title">공지사항</div>
        <div className="header-desc">앙팡테리블 펫 쇼핑몰의 새로운 소식을 확인하세요.</div>
      </div>

      {/* 반복 아이템이 돌아갈 리스트 영역 */}
      <div className="pet-item-list">
        {postData?.postList.map((post) => (
          <div 
            key={post.postId} 
            onClick={() => handleDetailMove(post.postId)}
            className="post-item-wrapper"
          >
            {/* 님이 만든 PostItem 컴포넌트를 여기서 사용 */}
            <PostComponent post={post} />
          </div>
        ))}
      </div>

      {/* 페이지네이션 (data.length 기반) */}
      <div className="pet-pagination-wrapper">
        <Pagination 
            totalCount={postData?.postList.length || 0} // 데이터 개수로 받기
            size={5}
        />
      </div>
    </div>
  );
}