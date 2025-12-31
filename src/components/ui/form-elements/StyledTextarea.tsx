"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useRef } from "react";

interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "glass" | "violet";
  autoResize?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

export const StyledTextarea = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ className, variant = "default", autoResize = false, showCharCount = false, maxLength, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize, props.value, textareaRef]);

    const variantStyles = {
      default: "bg-white/[0.02] border-white/10 focus:border-white/20 text-white/70",
      glass: "bg-white/[0.05] border-white/10 focus:border-white/20 text-white backdrop-blur-sm",
      violet: "bg-focus-violet/[0.02] border-focus-violet/20 focus:border-focus-violet/30 text-white",
    };

    const currentLength = typeof props.value === "string" ? props.value.length : 0;

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          className={cn(
            "transition-all duration-300 resize-none",
            variantStyles[variant],
            className
          )}
          onInput={(e) => {
            if (autoResize) {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }
            props.onInput?.(e);
          }}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/30">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

StyledTextarea.displayName = "StyledTextarea";

