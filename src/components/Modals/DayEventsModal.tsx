import React, { useState } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { formatDisplayDate } from '../../utils/dateUtils';
import { X, Plus, Trash2, Clock, Calendar, AlertCircle } from 'lucide-react';

export const DayEventsModal: React.FC = () => {
  const {
    selectedDateForEvents,
    setSelectedDateForEvents,
    events,
    addEvent,
    deleteEvent,
  } = useScheduleStore();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!selectedDateForEvents) return null;

  const dayEvents = events.filter((e) => e.date === selectedDateForEvents);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título do evento é obrigatório.');
      return;
    }

    addEvent({
      date: selectedDateForEvents,
      title: title.trim(),
      time: time || undefined,
      description: description.trim() || undefined,
    });

    setTitle('');
    setTime('');
    setDescription('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Eventos do Dia
              </h3>
              <p className="text-xs text-slate-500">
                {formatDisplayDate(selectedDateForEvents)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDateForEvents(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* List of existing events */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
              Eventos Cadastrados ({dayEvents.length})
            </h4>

            {dayEvents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                <p className="text-xs text-slate-500">
                  Nenhum evento registrado para este dia.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Preencha o formulário abaixo para adicionar reuniões, plantões especiais ou feriados.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{ev.title}</span>
                        {ev.time && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {ev.time}
                          </span>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-600">{ev.description}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteEvent(ev.id)}
                      title="Excluir evento"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to add event */}
          <form onSubmit={handleAddEvent} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Novo Evento para este Dia
            </h4>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Evento *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ex: Auditoria ou Reunião Clínica"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Horário (Opcional)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Evento
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedDateForEvents(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

