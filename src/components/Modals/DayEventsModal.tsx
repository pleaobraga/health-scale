import {
  X,
  Plus,
  Pencil,
  Check,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useScheduleStore } from '../../store/useScheduleStore';
import { formatDisplayDate } from '../../utils/dateUtils';

import type { CalendarEvent } from '../../types';

export const DayEventsModal: React.FC = () => {
  const {
    selectedDateForEvents,
    setSelectedDateForEvents,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useScheduleStore();

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or date changes
  useEffect(() => {
    setEditingEventId(null);
    setTitle('');
    setTime('');
    setDescription('');
    setError(null);
  }, [selectedDateForEvents]);

  if (!selectedDateForEvents) return null;

  const dayEvents = events.filter((e) => e.date === selectedDateForEvents);

  const handleStartEdit = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setTime(ev.time || '');
    setDescription(ev.description || '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setTitle('');
    setTime('');
    setDescription('');
    setError(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (editingEventId === eventId) {
      handleCancelEdit();
    }
    deleteEvent(eventId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título do evento é obrigatório.');
      return;
    }

    const finalTime = time.trim() || undefined;

    if (editingEventId) {
      updateEvent(editingEventId, {
        title: title.trim(),
        time: finalTime,
        description: description.trim() || undefined,
      });
      handleCancelEdit();
    } else {
      addEvent({
        date: selectedDateForEvents,
        title: title.trim(),
        time: finalTime,
        description: description.trim() || undefined,
      });
      setTitle('');
      setTime('');
      setDescription('');
      setError(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Eventos do Dia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDisplayDate(selectedDateForEvents)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDateForEvents(null)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* List of existing events */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Eventos Cadastrados ({dayEvents.length})
            </h4>

            {dayEvents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum evento registrado para este dia.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Preencha o formulário abaixo para adicionar reuniões, plantões especiais ou feriados.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((ev) => {
                  const isBeingEdited = editingEventId === ev.id;
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                        isBeingEdited
                          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {ev.title}
                          </span>
                          {ev.time && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              <span>{ev.time}</span>
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 break-words">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons: Edit and Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(ev)}
                          title="Editar evento"
                          aria-label={`Editar evento ${ev.title}`}
                          className={`p-1.5 rounded-lg transition ${
                            isBeingEdited
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60'
                              : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          title="Excluir evento"
                          aria-label={`Excluir evento ${ev.title}`}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form to add or edit event */}
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {editingEventId ? (
                  <>
                    <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Editar Evento</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Novo Evento para este Dia</span>
                  </>
                )}
              </h4>

              {editingEventId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Cancelar Edição</span>
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="event-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Horário (Opcional)
                </label>
                <input
                  id="event-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="event-description" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  id="event-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
              >
                {editingEventId ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Salvar Alterações</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Evento</span>
                  </>
                )}
              </button>

              {editingEventId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedDateForEvents(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
