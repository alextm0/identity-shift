"use client";

import { cn } from "@/lib/utils";

interface StepWrapperProps {
  children: React.ReactNode;
  showProgress?: boolean;
  currentIndex?: number;
  totalItems?: number;
  className?: string;
}

/**
 * Wrapper component for consistent step styling and progress display
 * 
 * Provides consistent spacing and optional progress indicator for multi-item steps.
 */
export function StepWrapper({
  children,
  showProgress = false,
  currentIndex,
  totalItems,
  className,
}: StepWrapperProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {children}

      {showProgress && currentIndex !== undefined && totalItems !== undefined && (
        <div className="text-center text-xs font-mono text-white/40 uppercase tracking-widest">
          {currentIndex + 1} of {totalItems} dimensions
        </div>
      )}
    </div>
  );
}

