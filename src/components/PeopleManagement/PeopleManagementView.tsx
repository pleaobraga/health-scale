import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { Person } from '../../types';
import { GlobalPersonModal } from './GlobalPersonModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Users, UserPlus, Search, Edit2, Trash2, CalendarCheck2, ShieldCheck } from 'lucide-react';

export const PeopleManagementView: React.FC = () => {
  const {
    persons,
    monthParticipants,
    currentMonth,
    addPerson,
    updatePerson,
    deletePerson,
  } = useScheduleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleOpenAdd = () => {
    setPersonToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person: Person) => {
    setPersonToEdit(person);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (person: Person) => {
    setPersonToDelete(person);
  };

  const handleSavePerson = (name: string, color: string) => {
    if (personToEdit) {
      updatePerson(personToEdit.id, name, color);
    } else {
      addPerson(name, color);
    }
  };

  const getParticipatingMonthsCount = (personId: string): number => {
    let count = 0;
    Object.values(monthParticipants).forEach((ids) => {
      if (ids.includes(personId)) count++;
    });
    return count;
  };

  const currentMonthParticipants = monthParticipants[currentMonth] || [];

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
              Cadastro Geral de Funcionários
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gestão mestre da equipe clínica e assistencial. Escalas e disponibilidades são definidas no Calendário.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Funcionário</span>
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
            placeholder="Buscar funcionários por nome..."
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Counter Pill */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Cadastrado:</span>
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
            {persons.length} {persons.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredPersons.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {searchQuery ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6">
            {searchQuery
              ? `Não foram encontrados resultados para "${searchQuery}". Tente outro termo.`
              : 'Comece adicionando os membros da sua equipe médica e assistencial ao sistema.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition"
            >
              Limpar termo de busca
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Primeiro Funcionário</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
          {filteredPersons.map((person) => {
            const monthsCount = getParticipatingMonthsCount(person.id);
            const isInCurrentMonth = currentMonthParticipants.includes(person.id);

            return (
              <div
                key={person.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition group"
              >
                {/* Person Card Top: Avatar & Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-sm font-bold text-slate-900 dark:text-white truncate"
                      title={person.name}
                    >
                      {person.name}
                    </h3>

                    {/* Color Swatch & Badge */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: person.color }}
                        title={person.color}
                      />
                      <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {person.color.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges / Stats */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{monthsCount} {monthsCount === 1 ? 'mês ativo' : 'meses ativos'}</span>
                  </span>

                  {isInCurrentMonth && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/60">
                      Na escala deste mês
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(person)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDelete(person)}
                    title={`Excluir cadastro de ${person.name}`}
                    aria-label={`Excluir cadastro de ${person.name}`}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
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

      {/* Confirmation Delete Dialog */}
      <ConfirmDeleteModal
        isOpen={Boolean(personToDelete)}
        person={personToDelete}
        onClose={() => setPersonToDelete(null)}
        onConfirm={() => {
          if (personToDelete) {
            deletePerson(personToDelete.id);
            setPersonToDelete(null);
          }
        }}
      />
    </div>
  );
};

