import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Person } from '../../types';
import { TAILWIND_PALETTE } from '../../constants/tailwindColors';
import { AvailabilityMiniCalendar } from './AvailabilityMiniCalendar';
import { X, Check, Trash2, User, Palette } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
  currentMonth: string;
  initialAvailableDays?: number[];
  onSave: (name: string, color: string, availableDays: number[]) => void;
  onDelete?: (id: string) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
  currentMonth,
  initialAvailableDays = [],
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAILWIND_PALETTE[0].hex);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setSelectedColor(personToEdit.color);
      setAvailableDays(initialAvailableDays);
    } else {
      setName('');
      // Random pick default color or first
      setSelectedColor(TAILWIND_PALETTE[0].hex);
      setAvailableDays([]);
    }
    setError(null);
  }, [personToEdit, initialAvailableDays, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da pessoa.');
      return;
    }
    onSave(name.trim(), selectedColor, availableDays);
    onClose();
  };

  const handleDelete = () => {
    if (personToEdit && onDelete) {
      if (confirm(`Tem certeza que deseja remover ${personToEdit.name}? Esta ação removerá também as escalas associadas.`)) {
        onDelete(personToEdit.id);
        onClose();
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <h3 className="text-base font-bold text-slate-800">
              {personToEdit ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Nome Completo / Identificação *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Dra. Camila Santos"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-slate-400"
            />
          </div>

          {/* Color Picker: Tailwind 500/600 circular dots without text names, checkmark on active */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              Cor de Identificação (Paleta Tailwind 500/600)
            </label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {TAILWIND_PALETTE.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSelected ? 'ring-2 ring-slate-800 ring-offset-2 scale-105 shadow-md' : ''
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Mini Calendar */}
          <div>
            <AvailabilityMiniCalendar
              month={currentMonth}
              selectedDays={availableDays}
              onChange={setAvailableDays}
              accentColor={selectedColor}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {personToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm rounded-xl transition"
              >
                {personToEdit ? 'Salvar Alterações' : 'Cadastrar Pessoa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

