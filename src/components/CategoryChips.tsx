import { serviceCategories } from "@/data/categories";
import { Heart, Wrench, Cpu, GraduationCap, Hammer, Truck, Users, Briefcase, Store, BookOpen } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  Heart, Wrench, Cpu, GraduationCap, Hammer, Truck, Users, Briefcase, Store, BookOpen,
};

interface CategoryChipsProps {
  selected: string | null;
  onSelect: (group: string | null) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-all duration-100 active:scale-[0.98] flex items-center gap-1.5 ${
          selected === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        Todos
      </button>
      {serviceCategories.map((cat) => {
        const Icon = iconMap[cat.icon];
        return (
          <button
            key={cat.group}
            onClick={() => onSelect(selected === cat.group ? null : cat.group)}
            className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-all duration-100 active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap ${
              selected === cat.group
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon size={16} />}
            {cat.group}
          </button>
        );
      })}
    </div>
  );
}
