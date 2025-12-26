import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export function GlassPanel({ children, className, hoverGlow = false, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass-pane transition-all duration-300",
        hoverGlow && "glass-pane-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

