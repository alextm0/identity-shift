import { FormLabel } from "./FormLabel";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({ 
  label, 
  required, 
  error, 
  children, 
  className,
  labelClassName 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <FormLabel className={labelClassName} required={required}>
          {label}
        </FormLabel>
      )}
      {children}
      {error && (
        <p className="text-bullshit-crimson text-[10px] font-mono uppercase">
          {error}
        </p>
      )}
    </div>
  );
}

