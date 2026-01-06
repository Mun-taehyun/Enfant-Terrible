const Reviews = () => {
  const reviews = [
    {
      id: 1,
      userName: '최성민',
      productName: '강아지 사료',
      content: '배송도 빠르고 좋아요!',
      createdAt: '2025-01-03',
    },
    {
      id: 2,
      userName: '문태현',
      productName: '고양이 장난감',
      content: '생각보다 별로에요.',
      createdAt: '2025-01-04',
    },
  ];

  return (
    <div>
      <h2>사용자 후기 관리</h2>
      <p>사용자가 작성한 상품 후기를 관리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>작성자</th>
            <th>상품명</th>
            <th>후기 내용</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.userName}</td>
              <td>{review.productName}</td>
              <td>{review.content}</td>
              <td>{review.createdAt}</td>
              <td>
                <button>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

export default Reviews;