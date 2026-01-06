/* 상태 배지 컴포넌트 */

interface StatusBadgeProps {
  status: 'ACTIVE' | 'BLOCKED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'ACTIVE';

  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        color: isActive ? '#155724' : '#721c24',
        backgroundColor: isActive ? '#d4edda' : '#f8d7da',
      }}
    >
      {isActive ? '활성' : '차단'}
    </span>
  );
}