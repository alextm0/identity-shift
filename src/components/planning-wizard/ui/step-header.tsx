import { cn } from "@/lib/utils";

interface StepHeaderProps {
    title: string;
    subtitle?: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function StepHeader({
    title,
    subtitle,
    description,
    children,
    className
}: StepHeaderProps) {
    return (
        <div className={cn("text-center space-y-4 mb-8", className)}>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                {title}
            </h1>
            {subtitle && (
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
            {description && (
                <p className="text-sm text-white/60 max-w-2xl mx-auto">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
