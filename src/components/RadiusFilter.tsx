import { radiusOptions } from "@/data/categories";

interface RadiusFilterProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RadiusFilter({ value, onChange }: RadiusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {radiusOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-all duration-100 active:scale-[0.98] ${
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
