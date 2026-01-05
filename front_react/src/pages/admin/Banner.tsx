const Banner = () => {
  const banners = [
    {
      id: 1,
      title: '메인 상단 배너',
      position: 'MAIN_TOP',
      visible: true,
    },
    {
      id: 2,
      title: '하단 프로모션 배너',
      position: 'FOOTER',
      visible: true,
    },
  ];

  return (
    <div>
      <h2>광고 배너 관리</h2>
      <p>쇼핑몰 내 배너 광고를 관리합니다.</p>

      <div style={{ marginTop: '16px', marginBottom: '12px' }}>
        <button>+ 배너 등록</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>배너명</th>
            <th>노출 위치</th>
            <th>노출 여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id}>
              <td>{banner.title}</td>
              <td>{banner.position}</td>
              <td>{banner.visible ? '노출' : '비노출'}</td>
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

export default Banner;