import { reviewQueries } from '@/querys/user/queryhooks/review.query';
import { useState } from 'react';
import { useParams} from 'react-router-dom';
import { useProduct } from '../product/use-product.hook';
import { fileQueries, orderQueries } from '@/querys/user/queryhooks';
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
                body: requestBody
            }, {
                onSuccess: () => resetForm()
            });
        } 
        else { //수정이 아닐 경우 => orderId 받아와야한다. 
            if(!orderData?.items[0].orderId) return;
            createMutation.mutate(
                {
                    orderId: orderData?.items[0].orderId,
                    ...requestBody
                }, 
                {onSuccess: () => resetForm()}
            );
        }
    };

    //서버상태: 파일쿼리 호출
    const uploadMutation = fileQueries.useUploadFile();

    // 파일 선택 시 실행되는 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('file', file); // 백엔드 필드명에 맞게 수정 ('images' 등)
        });

        //데이터 , 성공 시 => setImageUrlList를 받아온다. "이미지.."
        uploadMutation.mutate(formData, {
            onSuccess: (response) => {
                setImageUrlList(prev => [...prev, ...response.data]);
            }
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
    };

    return {
        reviewData, rating, reviewText, editingId,
        setRating, setReviewText, resetForm,
        editModeEventHandler, deleteReviewEventHandler, handleFileChange,
        reviewInsertUpdateEventHandler
    };
}