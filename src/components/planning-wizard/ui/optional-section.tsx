"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionalSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

export function OptionalSection({
    title,
    children,
    defaultExpanded = false,
    className
}: OptionalSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={cn("pt-4 border-t border-white/5", className)}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
            >
                <span className="text-xs font-mono text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">
                    {title}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", isExpanded && "rotate-180")} />
            </button>

            {isExpanded && (
                <div className="pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {children}
                </div>
            )}
        </div>
    );
}
