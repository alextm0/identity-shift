import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6", className)}>
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  span?: "sm" | "md" | "lg" | "xl" | "full";
}

export function BentoItem({ children, className, span = "sm" }: BentoItemProps) {
  const spanClasses = {
    sm: "md:col-span-1 lg:col-span-1",
    md: "md:col-span-2 lg:col-span-2",
    lg: "md:col-span-2 lg:col-span-3",
    xl: "md:col-span-3 lg:col-span-4",
    full: "md:col-span-4 lg:col-span-6",
  };

  return (
    <div className={cn(spanClasses[span], className)}>
      {children}
    </div>
  );
}

