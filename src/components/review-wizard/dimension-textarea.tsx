"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DIMENSION_LABELS, type LifeDimension } from "@/lib/validators/yearly-review";

interface DimensionTextareaProps {
    dimension: LifeDimension;
    question: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxWords?: number;
    className?: string;
}

export function DimensionTextarea({ 
    dimension, 
    question, 
    value, 
    onChange, 
    placeholder,
    maxWords = 200,
    className 
}: DimensionTextareaProps) {
    const label = DIMENSION_LABELS[dimension];
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    const isOverLimit = wordCount > maxWords;

    return (
        <div className={cn("space-y-6", className)}>
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    {label}
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                    {question}
                </p>
            </div>

            <div className="space-y-3">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Share your thoughts..."}
                    className={cn(
                        "min-h-[200px] md:min-h-[300px] text-base",
                        isOverLimit && "border-bullshit-crimson/50 focus:border-bullshit-crimson"
                    )}
                />
                
                <div className="flex justify-between items-center text-xs font-mono text-white/40">
                    <span className="uppercase tracking-widest">
                        {wordCount} / {maxWords} words
                    </span>
                    {isOverLimit && (
                        <span className="text-bullshit-crimson uppercase tracking-widest">
                            Over limit
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

