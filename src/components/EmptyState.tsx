import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon size={48} className="text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-[15px] text-muted-foreground max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-4 !text-[15px]">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
