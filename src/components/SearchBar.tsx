import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { allServices } from "@/data/categories";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const lower = value.toLowerCase();
    return allServices.filter((s) => s.toLowerCase().includes(lower)).slice(0, 5);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Veterinário, agrônomo, drone..."
          className="input-field pl-11 pr-10 !h-[54px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              className="w-full text-left px-4 py-3.5 text-[15px] hover:bg-muted transition-colors duration-100"
              onMouseDown={() => onChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
