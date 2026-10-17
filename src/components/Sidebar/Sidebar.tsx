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
    <aside className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-xs">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Pessoas do Mês</h2>
            <p className="text-[11px] text-slate-500">{persons.length} profissionais</p>
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
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* People List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-600">Nenhuma pessoa encontrada</p>
            <p className="text-[11px] text-slate-400 mt-1">
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
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>
          Clique no ícone de <strong>olho</strong> para iluminar no calendário todos os dias em que o profissional pode trabalhar.
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

