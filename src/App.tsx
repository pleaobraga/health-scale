import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import { ValidationPanel } from './components/Validation/ValidationPanel';
import { DayEventsModal } from './components/Modals/DayEventsModal';
import { FullScreenCalendarModal } from './components/Modals/FullScreenCalendarModal';

export const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row gap-5 p-3 sm:p-4 md:p-5 overflow-hidden max-w-[1700px] w-full mx-auto min-h-0">
        {/* Left Sidebar: Pessoas do Mês - Fixed without page scroll */}
        <div className="w-full lg:w-80 shrink-0 h-full overflow-hidden flex flex-col">
          <Sidebar />
        </div>

        {/* Central / Right Area: Calendar & Validation - Only this side scrolls */}
        <div className="flex-1 h-full overflow-y-auto pr-1 flex flex-col gap-5 min-w-0 pb-6 custom-scrollbar">
          <CalendarGrid />
          <ValidationPanel />
        </div>
      </main>

      {/* Global Modals */}
      <DayEventsModal />
      <FullScreenCalendarModal />
    </div>
  );
};

export default App;
