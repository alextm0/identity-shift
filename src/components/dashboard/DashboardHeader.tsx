import { format, getISOWeek } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  sprintName: string;
}

export function DashboardHeader({ sprintName }: DashboardHeaderProps) {
  const currentDate = new Date();
  const weekNumber = getISOWeek(currentDate);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
      <div>
        <h1 className="heading-1 uppercase mb-4">
          Command Center <span className="text-white/20 font-light">{" // "}</span> <span className="text-action-emerald">{currentDate.getFullYear()}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-6 label">
          <span className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {format(currentDate, "EEEE, MMMM d")}
          </span>
          <span className="h-3 w-[1px] bg-white/10" />
          <span>Week {weekNumber}</span>
          <span className="h-3 w-[1px] bg-white/10" />
          <span className="text-action-emerald">{sprintName}</span>
        </div>
      </div>
    </div>
  );
}

