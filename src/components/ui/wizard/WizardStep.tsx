import { cn } from "@/lib/utils";

interface WizardStepProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function WizardStep({
  children,
  className,
  size = "md"
}: WizardStepProps) {
  const maxWidths = {
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
  };

  return (
    <div className={cn("w-full mx-auto space-y-8", maxWidths[size], className)}>
      {children}
    </div>
  );
}

