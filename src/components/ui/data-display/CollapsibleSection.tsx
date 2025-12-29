"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
  icon,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-4", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("w-full group", headerClassName)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                {icon}
              </div>
            )}
            <div className="text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-white/20 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className={cn("animate-in fade-in slide-in-from-top-2 duration-300", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

