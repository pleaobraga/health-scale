import React from 'react';
import { Person } from '../../types';
import { Edit2, Eye, EyeOff } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  availableDaysCount: number;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
  onEdit: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  availableDaysCount,
  isHighlighted,
  onToggleHighlight,
  onEdit,
}) => {
  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
        isHighlighted
          ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Left: Color dot & Name & Available count */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: person.color }}
        />
        <div className="truncate">
          <p className="text-xs font-semibold text-slate-800 truncate" title={person.name}>
            {person.name}
          </p>
          <p className="text-[11px] text-slate-500">
            {availableDaysCount} {availableDaysCount === 1 ? 'dia disp.' : 'dias disp.'}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle View Availability */}
        <button
          type="button"
          onClick={onToggleHighlight}
          title={isHighlighted ? 'Ocultar destaque no calendário' : 'Destacar disponibilidade no calendário'}
          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
            isHighlighted
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          {isHighlighted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={onEdit}
          title="Editar nome, cor ou disponibilidade"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

