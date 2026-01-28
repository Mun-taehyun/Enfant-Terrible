const LoadingSpinner = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinner}></div>
      <p style={{ marginTop: '10px', color: '#555' }}>잠시만 기다려주세요...</p>
      
      {/* 애니메이션을 위한 스타일 태그 (CSS 파일에 넣어도 됨) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px', // 혹은 화면 전체를 덮으려면 '100vh'
    width: '100%',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3', // 배경색 (연한 회색)
    borderTop: '4px solid #3498db', // 돌아가는 부분 색상 (파란색)
    borderRadius: '50%',
    animation: 'spin 1s linear infinite', // 위에서 정의한 spin 애니메이션 적용
  }
};

export default LoadingSpinner;
//동그라미 로딩창 => 서버 불러올 때 사용 