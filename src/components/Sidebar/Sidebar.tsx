import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { PersonCard } from './PersonCard';
import { PersonModal } from './PersonModal';
import { Person } from '../../types';
import { UserPlus, Users, Sparkles, Search } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    persons,
    availabilities,
    currentMonth,
    highlightedPersonId,
    setHighlightedPersonId,
    addPerson,
    updatePerson,
    deletePerson,
    setPersonAvailability,
  } = useScheduleStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setPersonToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person: Person) => {
    setPersonToEdit(person);
    setIsModalOpen(true);
  };

  const handleSavePerson = (name: string, color: string, availableDays: number[]) => {
    if (personToEdit) {
      updatePerson(personToEdit.id, name, color);
      setPersonAvailability(personToEdit.id, currentMonth, availableDays);
    } else {
      addPerson(name, color, availableDays);
    }
  };

  const getPersonAvailableDays = (personId: string): number[] => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth
    );
    return avail ? avail.availableDays : [];
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{persons.length} profissionais</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Search Bar */}
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

      {/* People List - Has internal scroll if many people */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Nenhuma pessoa encontrada</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery ? 'Tente outro termo de busca.' : 'Clique em "Adicionar" para cadastrar.'}
            </p>
          </div>
        ) : (
          filteredPersons.map((person) => {
            const availDays = getPersonAvailableDays(person.id);
            return (
              <PersonCard
                key={person.id}
                person={person}
                availableDaysCount={availDays.length}
                isHighlighted={highlightedPersonId === person.id}
                onToggleHighlight={() => setHighlightedPersonId(person.id)}
                onEdit={() => handleOpenEdit(person)}
              />
            );
          })
        )}
      </div>

      {/* Informative Hint / Legend */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>
          Clique no ícone de <strong>olho</strong> para iluminar no calendário os dias disponíveis do profissional.
        </span>
      </div>

      {/* Person Add/Edit Modal */}
      <PersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        personToEdit={personToEdit}
        currentMonth={currentMonth}
        initialAvailableDays={personToEdit ? getPersonAvailableDays(personToEdit.id) : []}
        onSave={handleSavePerson}
        onDelete={deletePerson}
      />
    </aside>
  );
};
