import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import { ValidationPanel } from './components/Validation/ValidationPanel';
import { DayEventsModal } from './components/Modals/DayEventsModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-5">
        {/* Left Sidebar: Pessoas do Mês */}
        <div className="w-full lg:w-80 shrink-0 h-auto lg:h-[calc(100vh-6.5rem)] lg:sticky lg:top-20">
          <Sidebar />
        </div>

        {/* Central / Main Area: Calendar & Operation / Validation Footer */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <CalendarGrid />
          <ValidationPanel />
        </div>
      </main>

      {/* Global Modals */}
      <DayEventsModal />
    </div>
  );
};

export default App;

