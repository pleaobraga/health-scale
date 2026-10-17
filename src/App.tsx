import React, { useEffect } from 'react'
import { CalendarGrid } from './components/Calendar/CalendarGrid'
import { DayEventsModal } from './components/Modals/DayEventsModal'
import { FullScreenCalendarModal } from './components/Modals/FullScreenCalendarModal'
import { UnsavedChangesModal } from './components/Modals/UnsavedChangesModal'
import { HoverSidebar } from './components/Navigation/HoverSidebar'
import { PeopleManagementView } from './components/PeopleManagement/PeopleManagementView'
import { ImportView } from './components/Import/ImportView'
import { Sidebar } from './components/Sidebar/Sidebar'
import { ValidationPanel } from './components/Validation/ValidationPanel'
import { useScheduleStore } from './store/useScheduleStore'
import { hasExistingLocalData } from './services/backupService'

export const App: React.FC = () => {
  const currentView = useScheduleStore((state) => state.currentView)
  const setCurrentView = useScheduleStore((state) => state.setCurrentView)

  // Initial check / onboarding redirection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const hash = window.location.hash
      if (path.includes('importar') || hash.includes('importar')) {
        setCurrentView('import')
        return
      }
    }

    let mounted = true
    hasExistingLocalData().then((hasData) => {
      if (mounted && !hasData) {
        setCurrentView('import')
      }
    })
    return () => {
      mounted = false
    }
  }, [setCurrentView])

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors">
      {/* 1. Global Navigation: Hover Sidebar (Retractable on hover) */}
      <HoverSidebar />

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
        {currentView === 'calendar' ? (
          <main className="flex-1 flex flex-col lg:flex-row gap-5 p-3 sm:p-4 md:p-5 overflow-hidden max-w-[2000px] w-full mx-auto min-h-0">
            {/* Left Month Sidebar: Pessoas do Mês */}
            <div className="w-full lg:w-[21rem] shrink-0 h-full overflow-hidden flex flex-col">
              <Sidebar />
            </div>

            {/* Central / Right Area: Calendar & Validation */}
            <div className="flex-1 h-full overflow-y-auto pr-1 flex flex-col gap-5 min-w-0 pb-6 custom-scrollbar">
              <CalendarGrid />
              <ValidationPanel />
            </div>
          </main>
        ) : currentView === 'people' ? (
          /* 2. Global Master Management of People */
          <PeopleManagementView />
        ) : (
          /* 3. Dedicated Import Screen */
          <ImportView />
        )}
      </div>

      {/* Global Modals */}
      <DayEventsModal />
      <FullScreenCalendarModal />
      <UnsavedChangesModal />
    </div>
  )
}

export default App
