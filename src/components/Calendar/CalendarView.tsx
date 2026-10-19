import { CalendarGrid } from './CalendarGrid';
import { Sidebar } from '../Sidebar/Sidebar';
import { ValidationPanel } from '../Validation/ValidationPanel';

export function CalendarView() {
  return (
    <main
      data-testid="calendar-view"
      className="flex-1 flex flex-col lg:flex-row gap-5 p-3 sm:p-4 md:p-5 lg:overflow-hidden max-w-[2000px] w-full mx-auto min-h-0"
    >
      {/* Left Month Sidebar: Monthly Participants */}
      <div className="w-full lg:w-[21rem] shrink-0 lg:h-full flex flex-col">
        <Sidebar />
      </div>

      {/* Central / Right Area: Calendar & Validation */}
      <div className="flex-1 lg:h-full lg:overflow-y-auto pr-0 lg:pr-1 flex flex-col gap-5 min-w-0 pb-6 custom-scrollbar">
        <CalendarGrid />
        <ValidationPanel />
      </div>
    </main>
  );
};

export default CalendarView;

