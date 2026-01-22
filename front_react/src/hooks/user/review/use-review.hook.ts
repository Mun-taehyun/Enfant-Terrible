import { reviewQueries } from '@/querys/user/queryhooks/review.query';
import { useState } from 'react';
import { useParams} from 'react-router-dom';
import { useProduct } from '../product/use-product.hook';

export function useReview() {
    //경로 변수 : 제품Id
    const {productId} = useParams();
    const product = Number(productId);

    //커스텀 훅 : page 
    const {searchParams} = useProduct();
    const page = Number(searchParams.get("page")); //임시 page 변수 
    

    //서버상태: 서버에서 가져온 리뷰 목록 상태 (실제 환경에선 API로 관리)
    const {data : reviewData} = reviewQueries.useGetReviews(product,page,5);

    //서버상태: 추가 수정 삭제 리뷰
    const createMutation = reviewQueries.usePostReview(product);
    const updateMutation = reviewQueries.usePutReview(product);
    const deleteMutation = reviewQueries.useDeleteReview(product);
    
    // 입력 폼 상태
    const [rating, setRating] = useState("5");
    const [reviewText, setReviewText] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

// [등록 및 수정 실행]
    const handleSave = () => {
        if (!reviewText.trim()) return alert("내용을 입력해주세요.");

        if (editingId) {
            // 수정 모드
            updateMutation.mutate({
                reviewId: editingId,
                body: { content: reviewText, rating: Number(rating) }
            }, {
                onSuccess: () => resetForm();
            });
        } else {
            // 생성 모드
            if(!orderId) return;
            createMutation.mutate(
                {
                    orderId: 
                    content: reviewText,
                    rating: Number(rating)
                }, 
                {
                onSuccess: () => resetForm();
            });
        }
    };

    // [수정 모드 진입]
    const handleEditMode = (item: any) => {
        setEditingId(item.userId);
        setReviewText(item.content);
        setRating(String(item.rating));
    };

    // [삭제]
    const handleDelete = (id: number) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            setReviewData(prev => prev.filter(item => item.id !== id));
        }
    };

    // [취소]
    const handleCancel = () => {
        setEditingId(null);
        setReviewText("");
        setRating("5");
    };

    return {
        reviewData,
        rating,
        setRating,
        reviewText,
        setReviewText,
        editingId,
        handleSave,
        handleEditMode,
        handleDelete,
        handleCancel
    };
}