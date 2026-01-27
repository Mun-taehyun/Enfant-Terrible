import { useState, ChangeEvent } from 'react';
import { fileQueries } from '@/querys/user/queryhooks' 
import { inquiryQueries } from '@/querys/user/queryhooks/inquiry.query';
import { useProduct } from '@/hooks/user/product/use-product.hook';

export default function InquiryWriteForm() {
  const [content, setContent] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  //커스텀 훅 : productId 
  const {product} = useProduct();

  const { mutate: postInquiry} = inquiryQueries.usePostInquiry(product);

  // 1. 파일 업로드 훅 사용
  const { mutate: uploadFile, isPending: isUploading } = fileQueries.useUploadFile();

  // 2. 이미지 선택 시 즉시 서버 업로드
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    uploadFile(formData, {
      onSuccess: (res) => {
        // AxiosResponse 구조이므로 res.data 배열 추출
        const uploaded = res.data;
        setImageUrls((prev) => [...prev, ...uploaded]);
      },
      onError: () => alert('이미지 업로드에 실패했습니다.')
    });
  };

  // 3. 이미지 삭제 (리스트에서 제외)
  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. 최종 등록 (이 로직은 실제 상위의 등록 mutation과 연결하시면 됩니다)
    const handleSubmit = () => {
        if (!content.trim()) return alert('문의 내용을 입력해주세요.');
        
        // 2. 수집된 데이터 쏘기
        postInquiry(
            {
                content,
                isPrivate,
                imageUrls,
            }, 
            {
            onSuccess: () => {
                // 등록 성공 후 입력 폼 초기화하거나 리스트로 이동
                setContent('');
                setImageUrls([]);
                setIsPrivate(false);
            }
        });
    };

  return (
    <div className="inquiry-write-container">
      <div className="write-header">상품 문의 작성</div>

      <div className="write-body">
        {/* 내용 입력 영역 */}
        <textarea
          className="write-textarea"
          placeholder="배송, 재입고, 상품 상세 등에 대해 궁금한 점을 남겨주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 이미지 업로드 및 미리보기 영역 */}
        <div className="write-image-section">
          <label className={`image-upload-label ${isUploading ? 'uploading' : ''}`}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
              hidden 
              disabled={isUploading} 
            />
            <div className="plus-icon">{isUploading ? '⌛' : '+'}</div>
            <div className="count-text">{imageUrls.length} / 5</div>
          </label>

          <div className="write-preview-list">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="preview-box">
                <img src={url} alt="업로드 이미지" />
                <div className="delete-btn" onClick={() => removeImage(idx)}>×</div>
              </div>
            ))}
          </div>
        </div>

        {/* 설정 영역 (비밀글) */}
        <div className="write-options">
          <div className="private-check-row" onClick={() => setIsPrivate(!isPrivate)}>
            <div className={`custom-checkbox ${isPrivate ? 'checked' : ''}`}>
              {isPrivate && '✓'}
            </div>
            <span className="option-label">비밀글로 문의하기</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="write-actions">
        <div className="btn-cancel">취소</div>
        <div className="btn-submit" onClick={handleSubmit}>등록하기</div>
      </div>
    </div>
  );
}