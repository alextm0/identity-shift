import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormLabel({ children, className, required }: FormLabelProps) {
  return (
    <Label className={cn(
      "text-xs font-mono uppercase tracking-widest text-white/60",
      className
    )}>
      {children}
      {required && <span className="text-bullshit-crimson ml-1">*</span>}
    </Label>
  );
}

