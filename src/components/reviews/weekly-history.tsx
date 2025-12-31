"use client";

import { useState } from "react";
import { format } from "date-fns";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { ChevronDown, ChevronUp, History, ShieldAlert } from "lucide-react";
import { WeeklyReview } from "@/lib/types";

interface WeeklyHistoryProps {
  reviews: WeeklyReview[];
}

export function WeeklyHistory({ reviews }: WeeklyHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayReviews = isExpanded ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-white/20" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Review_History</h3>
        </div>
        <GlassPanel className="p-8 border-dashed border-white/5">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              No reviews yet
            </p>
            <p className="text-xs text-white/40">
              Complete your first weekly review to see history here
            </p>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-white/20" />
        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Review_History</h3>
        <span className="ml-auto px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-white/40 uppercase">
          {reviews.length} Total
        </span>
      </div>

      <div className="space-y-3">
        {displayReviews.map((review) => {
          const alerts = review.alerts as string[];
          const oneChange = review.oneChange;

          return (
            <GlassPanel key={review.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                    {format(new Date(review.weekEndDate), "MMM d, yyyy")}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-white/40" />
                      <span className="text-[10px] font-mono text-white/40">
                        ABS: <span className="text-white/80 font-bold">{review.antiBullshitScore}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      Evidence: <span className="text-white/80 font-bold">{review.evidenceRatio}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {oneChange && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">
                    One Change
                  </p>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-tight">
                    {oneChange.replace(/_/g, " ")}
                  </p>
                  {review.changeReason && (
                    <p className="text-[10px] text-white/50 mt-1 line-clamp-2">
                      {review.changeReason}
                    </p>
                  )}
                </div>
              )}

              {alerts && alerts.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">
                    Alerts ({alerts.length})
                  </p>
                  <div className="space-y-1">
                    {alerts.slice(0, 2).map((alert, idx) => (
                      <p key={idx} className="text-[10px] text-white/40 line-clamp-1">
                        {alert.split(":")[0]}
                      </p>
                    ))}
                    {alerts.length > 2 && (
                      <p className="text-[10px] text-white/30">
                        +{alerts.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </GlassPanel>
          );
        })}

        {reviews.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/60 hover:text-white"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest">
              {isExpanded ? "Show Less" : `Show All ${reviews.length} Reviews`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}






