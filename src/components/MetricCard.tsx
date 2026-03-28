import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
}

export default function MetricCard({ icon: Icon, label, value, change }: MetricCardProps) {
  return (
    <div className="card-agro flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={18} />
        <span className="text-[14px]">{label}</span>
      </div>
      <span className="text-2xl font-medium">{value}</span>
      {change && <span className="text-[13px] text-[hsl(var(--success))]">{change}</span>}
    </div>
  );
}
