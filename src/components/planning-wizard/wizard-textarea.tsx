"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface WizardTextareaProps {
    id?: string;
    label?: string;
    helper?: string;
    description?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    minHeight?: string;
    className?: string;
    textareaClassName?: string;
    showCount?: boolean;
    counterLabel?: string;
    children?: React.ReactNode;
}

export function WizardTextarea({
    id,
    label,
    helper,
    description,
    value,
    onChange,
    placeholder,
    maxLength,
    minHeight = "300px",
    className,
    textareaClassName,
    showCount = true,
    counterLabel,
    children,
}: WizardTextareaProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {(label || helper) && (
                <div className="flex flex-col space-y-1">
                    {label && (
                        <Label htmlFor={id} className="text-xs font-mono text-white/80 uppercase tracking-widest">
                            {label}
                        </Label>
                    )}
                    {helper && (
                        <p className="text-xs text-white/40 italic">
                            {helper}
                        </p>
                    )}
                </div>
            )}

            {description && (
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                    {description}
                </p>
            )}

            <Textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 text-lg focus:border-focus-violet/30 focus:ring-focus-violet/10 transition-all resize-none p-6",
                    textareaClassName
                )}
                style={{ minHeight }}
                maxLength={maxLength}
            />

            <div className="flex justify-between items-center px-1">
                {showCount && maxLength ? (
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        {value.length} / {maxLength} characters
                    </p>
                ) : <div />}

                {counterLabel && (
                    <p className="text-[10px] font-mono text-action-emerald/40 uppercase tracking-widest">
                        {counterLabel}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}
