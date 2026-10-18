import { X, Check, User, Palette } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { TAILWIND_PALETTE } from '../../constants/tailwindColors';

import type { Person } from '../../types';

interface GlobalPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
  onSave: (name: string, color: string) => void;
}

export const GlobalPersonModal: React.FC<GlobalPersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAILWIND_PALETTE[0].hex);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setSelectedColor(personToEdit.color);
    } else {
      setName('');
      setSelectedColor(TAILWIND_PALETTE[0].hex);
    }
    setError(null);
  }, [personToEdit, isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor, informe o nome do funcionário.');
      return;
    }
    onSave(trimmed, selectedColor);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-person-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-base"
              style={{ backgroundColor: selectedColor }}
            >
              {name.trim() ? name.trim().charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3
                id="global-person-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {personToEdit ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {personToEdit ? 'Altere o nome ou cor cadastral' : 'Cadastre um novo profissional na equipe'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Fechar (ESC)"
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label
              htmlFor="person-name-input"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Nome Completo / Identificação *</span>
            </label>
            <input
              id="person-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Dra. Mariana Costa, Enf. Pedro..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 transition"
            />
          </div>

          {/* Color Palette Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Cor de Destaque / Identificação</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {TAILWIND_PALETTE.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name || 'Cor Personalizada'}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {selectedColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-56 overflow-y-auto">
              {TAILWIND_PALETTE.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    title={`${color.name} (${color.hex})`}
                    aria-label={color.name}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-3 ring-indigo-500 dark:ring-indigo-400 scale-105 shadow-md'
                        : 'hover:scale-105 hover:shadow-xs'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition"
            >
              {personToEdit ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

