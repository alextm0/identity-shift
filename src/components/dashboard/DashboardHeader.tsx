import { format, getISOWeek } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  sprintName: string;
}

export function DashboardHeader({ sprintName }: DashboardHeaderProps) {
  const currentDate = new Date();
  const weekNumber = getISOWeek(currentDate);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
      <div>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white/90">
          Identity <span className="text-white/10 font-thin ml-1">{" // "}</span> <span className="text-action-emerald">Shift</span>
        </h1>
        <div className="flex flex-wrap items-center gap-6 label">
          <span className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </span>
          <span className="h-3 w-[1px] bg-white/10" />
          <span>Week {weekNumber}</span>
          <span className="h-3 w-[1px] bg-white/10" />
          <span className="text-action-emerald border-l border-white/10 pl-6 ml-auto md:ml-0">{sprintName}</span>
        </div>
      </div>
    </div>
  );
}

