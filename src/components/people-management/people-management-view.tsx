import { Users, UserPlus, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDeleteModal } from './confirm-delete-modal'
import { DeactivatePersonModal } from './deactivate-person-modal'
import { GlobalPersonModal } from './global-person-modal'
import { PersonManagementCard } from './person-management-card'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Person } from '../../types'

export function PeopleManagementView() {
  const { t } = useTranslation(['people', 'common'])
  const {
    persons,
    monthParticipants,
    currentMonth,
    addPerson,
    updatePerson,
    deletePerson,
    canDeletePerson,
    deactivatePerson,
    reactivatePerson,
  } = useScheduleStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null)
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null)
  const [personToDeactivate, setPersonToDeactivate] = useState<Person | null>(null)

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const activeCount = persons.filter((p) => p.active !== false).length
  const inactiveCount = persons.filter((p) => p.active === false).length

  const handleOpenAdd = () => {
    setPersonToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (person: Person) => {
    setPersonToEdit(person)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (person: Person) => {
    if (canDeletePerson(person.id)) {
      setPersonToDelete(person)
    } else {
      setPersonToDeactivate(person)
    }
  }

  const handleSavePerson = (name: string, color: string) => {
    if (personToEdit) {
      updatePerson(personToEdit.id, name, color)
    } else {
      addPerson(name, color)
    }
  }

  const getParticipatingMonthsCount = (personId: string): number => {
    let count = 0
    Object.values(monthParticipants).forEach((ids) => {
      if (ids.includes(personId)) count++
    })
    return count
  }

  const currentMonthParticipants = monthParticipants[currentMonth] || []

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-[1500px] w-full mx-auto custom-scrollbar">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('people:management.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('people:management.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('people:management.newPerson')}</span>
        </button>
      </div>

      {/* Filters & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex items-center shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('people:management.searchPlaceholder')}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
            >
              {t('people:management.clearSearch')}
            </button>
          )}
        </div>

        {/* Counter Pill */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('people:management.totalRegistered')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
              {activeCount === 1
                ? t('people:management.activeBadge', { count: activeCount })
                : t('people:management.activeBadgePlural', { count: activeCount })}
            </span>
            {inactiveCount > 0 && (
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                {inactiveCount === 1
                  ? t('people:management.inactiveBadge', { count: inactiveCount })
                  : t('people:management.inactiveBadgePlural', { count: inactiveCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredPersons.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {searchQuery ? t('people:management.emptySearchTitle') : t('people:management.emptyListTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6">
            {searchQuery
              ? t('people:management.emptySearchDesc', { query: searchQuery })
              : t('people:management.emptyListDesc')}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition"
            >
              {t('people:management.clearSearchBtn')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('people:management.registerFirst')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
          {filteredPersons.map((person) => {
            const monthsCount = getParticipatingMonthsCount(person.id)
            const isInCurrentMonth = currentMonthParticipants.includes(person.id)
            const canDelete = canDeletePerson(person.id)

            return (
              <PersonManagementCard
                key={person.id}
                person={person}
                monthsCount={monthsCount}
                isInCurrentMonth={isInCurrentMonth}
                canDelete={canDelete}
                onEdit={handleOpenEdit}
                onDeactivate={setPersonToDeactivate}
                onDeleteRequest={handleDeleteRequest}
                onReactivate={reactivatePerson}
              />
            )
          })}
        </div>
      )}

      {/* Add / Edit Global Person Modal */}
      <GlobalPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        personToEdit={personToEdit}
        onSave={handleSavePerson}
      />

      {/* Confirmation Permanent Delete Dialog (0 historical allocations) */}
      <ConfirmDeleteModal
        isOpen={Boolean(personToDelete)}
        person={personToDelete}
        onClose={() => setPersonToDelete(null)}
        onConfirm={() => {
          if (personToDelete) {
            deletePerson(personToDelete.id)
            setPersonToDelete(null)
          }
        }}
      />

      {/* Deactivate Interception Dialog (Has historical allocations) */}
      <DeactivatePersonModal
        isOpen={Boolean(personToDeactivate)}
        person={personToDeactivate}
        onClose={() => setPersonToDeactivate(null)}
        onConfirm={() => {
          if (personToDeactivate) {
            deactivatePerson(personToDeactivate.id)
            setPersonToDeactivate(null)
          }
        }}
      />
    </div>
  )
}
