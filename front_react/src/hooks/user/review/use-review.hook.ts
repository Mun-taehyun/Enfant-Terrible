import { reviewQueries } from '@/querys/user/queryhooks/review.query';
import { useState } from 'react';
import { useParams} from 'react-router-dom';
import { useProduct } from '../product/use-product.hook';
import { orderQueries } from '@/querys/user/queryhooks';
import ReviewItem from '@/types/user/interface/review.interface';

export function useReview() {
    //경로 변수 : 제품Id
    const {productId} = useParams();
    const product = Number(productId);

    //커스텀 훅 : page 
    const {searchParams} = useProduct();
    const page = Number(searchParams.get("page")); //임시 page 변수 

    //서버상태: 서버에서 가져온 리뷰 목록 상태 (실제 환경에선 API로 관리)
    const {data : reviewData} = reviewQueries.useGetReviews(product,page,5);
    //서버상태: 주문조회 
    const {data : orderData} = orderQueries.useGetOrderMy(page , 5);

    //서버상태: 추가 수정 삭제 리뷰
    const createMutation = reviewQueries.usePostReview(product);
    const updateMutation = reviewQueries.usePutReview(product);
    const deleteMutation = reviewQueries.useDeleteReview(product);
    
    //상태: 별점
    const [rating, setRating] = useState("5");
    //상태: 리뷰작성
    const [reviewText, setReviewText] = useState("");
    //상태: 수정상태여부
    const [editingId, setEditingId] = useState<number | null>(null);
    //상태: 이미지 배열 상태여부
    const [imageUrlList , setImageUrlList] = useState<string[]>([]);
    //상태: 업로드할 이미지 파일들
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    //상태: 미리보기 URL
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    //이벤트핸들러 : 생성 , 수정 리뷰 이벤트핸들러
    const reviewInsertUpdateEventHandler = () => {
        if (!reviewText.trim()) return alert("내용을 입력해주세요.");

        const requestBody ={
            rating: Number(rating),
            content: reviewText,
            imageUrls: imageUrlList
        }
        if (editingId) {//수정 시 
            updateMutation.mutate({
                reviewId: editingId,
                body: requestBody,
                images: imageFiles
            }, {
                onSuccess: () => resetForm()
            });
        } 
        else { //수정이 아닐 경우 => orderId 받아와야한다. 
            if(!orderData?.items[0].orderId) return;
            createMutation.mutate(
                {
                    body: {
                        orderId: orderData?.items[0].orderId,
                        ...requestBody
                    },
                    images: imageFiles
                },
                {onSuccess: () => resetForm()}
            );
        }
    };

    // 파일 선택 시 실행되는 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const incoming = Array.from(files);
        setImageFiles((prev) => {
            const merged = [...prev, ...incoming].slice(0, 5);
            return merged;
        });

        const incomingPreviews = incoming.map((f) => URL.createObjectURL(f));
        setImagePreviewUrls((prev) => {
            const merged = [...prev, ...incomingPreviews].slice(0, 5);
            // 초과된 preview는 revoke
            if (merged.length < prev.length + incomingPreviews.length) {
                const overflow = [...prev, ...incomingPreviews].slice(5);
                overflow.forEach((u) => URL.revokeObjectURL(u));
            }
            return merged;
        });

        e.target.value = '';
    };

    const removeImageAt = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviewUrls((prev) => {
            const target = prev[index];
            if (target) URL.revokeObjectURL(target);
            return prev.filter((_, i) => i !== index);
        });
    };

    //이벤트핸들러: 수정상태 이벤트처리
    const editModeEventHandler = (item: ReviewItem) => {
        setEditingId(item.reviewId);
        setReviewText(item.content);
        setRating(String(item.rating));
        window.scrollTo({ top: 500, behavior: 'smooth' }); // 입력창 위치로 적절히 조절
    };

    //이벤트핸들러: 삭제 이벤트 처리
    const deleteReviewEventHandler = (reviewId: number) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            deleteMutation.mutate(reviewId);
            resetForm();
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setReviewText("");
        setRating("5");
        setImageUrlList([]); // 이미지 목록도 초기화
        setImageFiles([]);

        setImagePreviewUrls((prev) => {
            prev.forEach((u) => URL.revokeObjectURL(u));
            return [];
        });
    };

    return {
        reviewData, rating, reviewText, editingId,
        setRating, setReviewText, resetForm,
        editModeEventHandler, deleteReviewEventHandler, handleFileChange,
        reviewInsertUpdateEventHandler, imagePreviewUrls, removeImageAt
    };
}