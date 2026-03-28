import * as React from "react";

interface ProgressStepsProps {
  current: number;
  total: number;
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(({ current, total }, ref) => {
  return (
    <div ref={ref} className="w-full">
      <p className="mb-2 text-[16px] font-medium text-foreground">Etapa {current} de {total}</p>
      <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-border">
        <div
          className="h-full rounded-[3px] bg-primary transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
});

ProgressSteps.displayName = "ProgressSteps";

export default ProgressSteps;
