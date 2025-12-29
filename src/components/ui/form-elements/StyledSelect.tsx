import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "glass" | "violet";
}

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white/[0.02] border-white/10 focus:border-white/20 text-white/70",
      glass: "bg-white/[0.05] border-white/10 focus:border-white/20 text-white backdrop-blur-sm",
      violet: "bg-focus-violet/[0.02] border-focus-violet/20 focus:border-focus-violet/30 text-white",
    };

    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

StyledSelect.displayName = "StyledSelect";

