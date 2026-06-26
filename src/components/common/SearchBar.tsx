import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`tm-search ${className}`} style={{ minWidth: 240 }}>
      <Search size={16} />
      <input
        className="tm-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
