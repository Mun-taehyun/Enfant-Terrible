const Popup = () => {
  const popups = [
    {
      id: 1,
      title: '신년 이벤트',
      period: '2025-01-01 ~ 2025-01-07',
      visible: true,
    },
    {
      id: 2,
      title: '배송비 무료 행사',
      period: '2025-01-10 ~ 2025-01-15',
      visible: false,
    },
  ];

  return (
    <div>
      <h2>광고 팝업 관리</h2>
      <p>쇼핑몰에 노출되는 팝업 광고를 관리합니다.</p>

      <div style={{ marginTop: '16px', marginBottom: '12px' }}>
        <button>+ 팝업 등록</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>제목</th>
            <th>노출 기간</th>
            <th>노출 여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {popups.map((popup) => (
            <tr key={popup.id}>
              <td>{popup.title}</td>
              <td>{popup.period}</td>
              <td>{popup.visible ? '노출' : '비노출'}</td>
              <td>
                <button style={{ marginRight: '8px' }}>수정</button>
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
  marginTop: '12px',
  borderCollapse: 'collapse',
};

export default Popup;