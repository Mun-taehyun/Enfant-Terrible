/* 검색 바 컴포넌트 */
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = '검색어를 입력하세요',
}: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        width: '240px',
      }}
    />
  );
}