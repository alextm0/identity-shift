"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
    isSelected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export function SelectionCard({
    isSelected,
    onClick,
    children,
    className
}: SelectionCardProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none",
                isSelected
                    ? "bg-focus-violet/10 border-focus-violet/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10",
                className
            )}
            onClick={onClick}
        >
            <button
                className={cn(
                    "transition-all",
                    isSelected ? "text-focus-violet" : "text-white/40"
                )}
            >
                {isSelected ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <Circle className="h-5 w-5" />
                )}
            </button>
            <div className="flex-1 text-white font-medium text-sm">
                {children}
            </div>
        </div>
    );
}
