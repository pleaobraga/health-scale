import React from 'react';
import { getDaysCountInMonth, formatMonthYear } from '../../utils/dateUtils';
import { Sparkles, Eraser, CheckSquare, Calendar } from 'lucide-react';

interface AvailabilityMiniCalendarProps {
  month: string; // 'YYYY-MM'
  selectedDays: number[];
  onChange: (days: number[]) => void;
  accentColor?: string;
}

export const AvailabilityMiniCalendar: React.FC<AvailabilityMiniCalendarProps> = ({
  month,
  selectedDays,
  onChange,
  accentColor = '#3b82f6',
}) => {
  const totalDays = getDaysCountInMonth(month);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const selectEven = () => {
    onChange(daysArray.filter((d) => d % 2 === 0));
  };

  const selectOdd = () => {
    onChange(daysArray.filter((d) => d % 2 !== 0));
  };

  const selectAll = () => {
    onChange([...daysArray]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium pb-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          Disponibilidade ({formatMonthYear(month)})
        </span>
        <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 font-medium">
          {selectedDays.length} / {totalDays} dias
        </span>
      </div>

      {/* Quick selection shortcuts */}
      <div className="flex items-center flex-wrap gap-1.5">
        <button
          type="button"
          onClick={selectEven}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
        >
          <CheckSquare className="w-3 h-3 text-emerald-600" />
          Dias Pares
        </button>
        <button
          type="button"
          onClick={selectOdd}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
        >
          <CheckSquare className="w-3 h-3 text-amber-600" />
          Dias Ímpares
        </button>
        <button
          type="button"
          onClick={selectAll}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
        >
          <Sparkles className="w-3 h-3 text-indigo-600" />
          Todos
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 transition ml-auto"
        >
          <Eraser className="w-3 h-3 text-rose-500" />
          Limpar
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {daysArray.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              style={
                isSelected
                  ? { backgroundColor: accentColor, color: '#ffffff', borderColor: accentColor }
                  : undefined
              }
              className={`h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'shadow-sm font-semibold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

