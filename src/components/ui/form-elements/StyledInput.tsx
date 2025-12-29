import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "violet";
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white/[0.02] border-white/10 focus:border-white/20 text-white/70",
      glass: "bg-white/[0.05] border-white/10 focus:border-white/20 text-white backdrop-blur-sm",
      violet: "bg-focus-violet/[0.02] border-focus-violet/20 focus:border-focus-violet/30 text-white",
    };

    return (
      <Input
        ref={ref}
        className={cn(
          "transition-all duration-300",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

StyledInput.displayName = "StyledInput";

