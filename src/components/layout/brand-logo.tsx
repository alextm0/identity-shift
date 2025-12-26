import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
    return (
        <div className={cn("relative group cursor-pointer", className)}>
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-focus-violet/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon */}
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10"
            >
                {/* Geometric Monogram 'IS' (Identity Shifter) */}
                <path
                    d="M24 4L10 12V36L24 44L38 36V12L24 4Z"
                    className="stroke-white/10 fill-white/[0.02] stroke-[1]"
                />
                <path
                    d="M24 10L14 16V32L24 38L34 32V16L24 10Z"
                    className="stroke-focus-violet group-hover:stroke-focus-violet/80 transition-colors stroke-[2]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M24 18V30M19 21L24 18L29 21M19 27L24 30L29 27"
                    className="stroke-action-emerald stroke-[2]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
