import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { PersonCard } from './PersonCard';
import { AddMonthParticipantsModal } from './AddMonthParticipantsModal';
import { MonthAvailabilityModal } from './MonthAvailabilityModal';
import { Person } from '../../types';
import { formatMonthYear } from '../../utils/dateUtils';
import { UserPlus, Users, Sparkles, Search } from 'lucide-react';

export const Sidebar: React.FC = () => {
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
  } = useScheduleStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [personForAvailability, setPersonForAvailability] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persons assigned to this month
  const currentParticipantIds = monthParticipants[currentMonth] || [];
  const monthPersons = persons.filter((p) => currentParticipantIds.includes(p.id));

  const filteredPersons = monthPersons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const getPersonAvailableDays = (personId: string): number[] => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth
    );
    return avail ? avail.availableDays : [];
  };

  const getPersonWorkingDaysCount = (personId: string): number => {
    let count = 0;
    Object.entries(assignments).forEach(([dateStr, personIds]) => {
      if (dateStr.startsWith(currentMonth) && personIds.includes(personId)) {
        count++;
      }
    });
    return count;
  };

  const handleSaveAvailability = (personId: string, days: number[]) => {
    setPersonAvailability(personId, currentMonth, days);
  };

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-xs overflow-hidden transition-colors">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pessoas do Mês</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {monthPersons.length} {monthPersons.length === 1 ? 'vinculada' : 'vinculadas'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          title="Vincular funcionários ao mês"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Vincular</span>
        </button>
      </div>

      {/* Search Bar (only shown if there are participants) */}
      {monthPersons.length > 0 && (
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* People List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {monthPersons.length === 0 ? (
          /* Empty state when NO ONE is linked to this month */
          <div className="text-center py-10 px-4 flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhuma pessoa no mês
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              Vincule funcionários cadastrados para definir disponibilidades e plantões em{' '}
              <strong className="capitalize">{formatMonthYear(currentMonth)}</strong>.
            </p>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Adicionar Pessoas ao Mês</span>
            </button>
          </div>
        ) : filteredPersons.length === 0 ? (
          /* Filter gives 0 results */
          <div className="text-center py-8 px-4">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Nenhum participante encontrado</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block mx-auto"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          filteredPersons.map((person) => {
            const availDays = getPersonAvailableDays(person.id);
            const workingDays = getPersonWorkingDaysCount(person.id);
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
            );
          })
        )}
      </div>

      {/* Informative Hint / Legend */}
      {monthPersons.length > 0 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Clique no <strong>lápis</strong> para configurar disponibilidades e no <strong>olho</strong> para destacá-las na grade.
          </span>
        </div>
      )}

      {/* Add Participants to Month Modal */}
      <AddMonthParticipantsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentMonth={currentMonth}
        allPersons={persons}
        currentParticipantIds={currentParticipantIds}
        onAddParticipants={(ids) => addPersonsToMonth(ids, currentMonth)}
        onGoToGlobalManagement={() => setCurrentView('people')}
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
  );
};
