import { format, getISOWeek } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  sprintName: string;
}

export function DashboardHeader({ sprintName }: DashboardHeaderProps) {
  const currentDate = new Date();
  const weekNumber = getISOWeek(currentDate);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 pb-3 md:pb-4 border-b border-white/5">
      <div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-1 md:mb-4 text-white/90">
          Identity <span className="text-white/10 font-thin ml-1">{" // "}</span> <span className="text-action-emerald">Shift</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 md:gap-6 label text-[10px] md:text-[12px]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
            {format(currentDate, "EEE, MMM d")}
          </span>
          <span className="h-3 w-[1px] bg-white/10 hidden md:block" />
          <span className="hidden md:inline">Week {weekNumber}</span>
          <span className="h-3 w-[1px] bg-white/10 hidden md:block" />
          <span className="text-action-emerald md:border-l md:border-white/10 md:pl-6">{sprintName}</span>
        </div>
      </div>
    </div>
  );
}

