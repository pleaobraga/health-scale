import { UserPlus, Users, Sparkles, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AddMonthParticipantsModal } from './add-month-participants-modal'
import { MonthAvailabilityModal } from './month-availability-modal'
import { PersonCard } from './person-card'
import { useScheduleStore } from '../../store/use-schedule-store'
import { formatMonthYear } from '../../utils/date-utils'

import type { Person } from '../../types'

export function Sidebar() {
  const { t, i18n } = useTranslation(['people', 'common'])
  const navigate = useNavigate()
  const {
    persons,
    monthParticipants,
    availabilities,
    assignments,
    currentMonth,
    isEditMode,
    highlightedPersonId,
    setHighlightedPersonId,
    addPersonsToMonth,
    removePersonFromMonth,
    setPersonAvailability,
    insertAllPersonDaysToMonth,
    setCurrentView,
  } = useScheduleStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [personForAvailability, setPersonForAvailability] = useState<Person | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Persons assigned to this month
  const currentParticipantIds = monthParticipants[currentMonth] || []
  const monthPersons = persons.filter((p) => currentParticipantIds.includes(p.id))

  const filteredPersons = monthPersons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const getPersonAvailableDays = (personId: string): number[] => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth
    )
    return avail ? avail.availableDays : []
  }

  const getPersonWorkingDaysCount = (personId: string): number => {
    let count = 0
    Object.entries(assignments).forEach(([dateStr, personIds]) => {
      if (dateStr.startsWith(currentMonth) && personIds.includes(personId)) {
        count++
      }
    })
    return count
  }

  const handleSaveAvailability = (personId: string, days: number[]) => {
    setPersonAvailability(personId, currentMonth, days)
  }

  const handleGoToGlobalManagement = () => {
    setCurrentView('people')
    navigate('/pessoas')
  }

  return (
    <aside className="w-full lg:h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-xs overflow-hidden transition-all duration-300">
      {/* Sidebar Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer lg:cursor-default select-none"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsCollapsed(!isCollapsed)
            }
          }}
          title={t('people:sidebar.togglePanel')}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>{t('people:sidebar.title')}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {monthPersons.length === 1
                ? t('people:sidebar.linkedCount', { count: monthPersons.length })
                : t('people:sidebar.linkedCountPlural', { count: monthPersons.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            title={t('people:sidebar.linkButtonTooltip')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">{t('people:sidebar.linkButton')}</span>
          </button>

          {/* Minimize / Expand Toggle Button on screens < 1024px */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? t('people:sidebar.expandAria') : t('people:sidebar.collapseAria')}
            aria-label={isCollapsed ? t('people:sidebar.expandAria') : t('people:sidebar.collapseAria')}
            aria-expanded={!isCollapsed}
            data-testid="toggle-sidebar-collapse"
            className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <span className="text-[11px]">
              {isCollapsed ? t('people:sidebar.expand') : t('people:sidebar.collapse')}
            </span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content Area on screens < 1024px, Always visible on lg */}
      <div className={`${isCollapsed ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-h-0`}>
        {/* Search Bar (only shown if there are participants) */}
        {monthPersons.length > 0 && (
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('people:sidebar.searchPlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* People List */}
        <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-none p-3 space-y-2 min-h-0 custom-scrollbar">
          {monthPersons.length === 0 ? (
            /* Empty state when NO ONE is linked to this month */
            <div className="text-center py-10 px-4 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t('people:sidebar.emptyTitle')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                {t('people:sidebar.emptyDesc')}{' '}
                <strong className="capitalize">{formatMonthYear(currentMonth, i18n.language)}</strong>.
              </p>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('people:sidebar.addPersonsToMonth')}</span>
              </button>
            </div>
          ) : filteredPersons.length === 0 ? (
            /* Filter gives 0 results */
            <div className="text-center py-8 px-4">
              <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('people:sidebar.noResults')}</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block mx-auto"
              >
                {t('people:sidebar.clearSearch')}
              </button>
            </div>
          ) : (
            filteredPersons.map((person) => {
              const availDays = getPersonAvailableDays(person.id)
              const workingDays = getPersonWorkingDaysCount(person.id)
              return (
                <PersonCard
                  key={person.id}
                  person={person}
                  availableDaysCount={availDays.length}
                  workingDaysCount={workingDays}
                  isHighlighted={highlightedPersonId === person.id}
                  isEditMode={isEditMode}
                  onToggleHighlight={() => setHighlightedPersonId(person.id)}
                  onEdit={() => setPersonForAvailability(person)}
                  onInsertAllDays={() => insertAllPersonDaysToMonth(person.id, currentMonth)}
                  onRemoveFromMonth={() => removePersonFromMonth(person.id, currentMonth)}
                />
              )
            })
          )}
        </div>

        {/* Informative Hint / Legend */}
        {monthPersons.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t('people:sidebar.hint') }} />
          </div>
        )}
      </div>

      {/* Add Participants to Month Modal */}
      <AddMonthParticipantsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentMonth={currentMonth}
        allPersons={persons}
        currentParticipantIds={currentParticipantIds}
        onAddParticipants={(ids) => addPersonsToMonth(ids, currentMonth)}
        onGoToGlobalManagement={handleGoToGlobalManagement}
      />

      {/* Month Availability Modal */}
      <MonthAvailabilityModal
        isOpen={Boolean(personForAvailability)}
        onClose={() => setPersonForAvailability(null)}
        person={personForAvailability}
        currentMonth={currentMonth}
        initialAvailableDays={
          personForAvailability ? getPersonAvailableDays(personForAvailability.id) : []
        }
        onSave={handleSaveAvailability}
      />
    </aside>
  )
}
