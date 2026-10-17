import React, { useState } from 'react';
import { CalendarDays, Users, Sun, Moon, Download, Upload, Check } from 'lucide-react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { NavigationTab } from '../../types';
import { exportAppData } from '../../services/backupService';

export const HoverSidebar: React.FC = () => {
  const { currentView, setCurrentView, isDarkMode, toggleDarkMode } = useScheduleStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'calendar',
      label: 'Calendário de Escalas',
      icon: CalendarDays,
    },
    {
      id: 'people',
      label: 'Gerenciar Pessoas',
      icon: Users,
    },
    {
      id: 'import',
      label: 'Importar Dados',
      icon: Upload,
    },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAppData();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside
      data-testid="hover-sidebar"
      className="group/sidebar h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 w-16 hover:w-64 shrink-0 shadow-sm overflow-hidden select-none"
    >
      {/* Top: Logo & App Branding */}
      <div>
        <div className="flex items-center gap-3 px-3.5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <CalendarDays className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              Escalas Mensais
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              HealthScale
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1.5" aria-label="Menu Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent font-medium'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Actions & Theme Toggle */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {/* Immediate Action: Exportar Dados */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          title="Exportar Dados"
          aria-label="Exportar Dados"
          className="w-full flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
            {exportSuccess ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </div>
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
            {exportSuccess ? 'Exportado!' : 'Exportar Dados'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>
      </div>
    </aside>
  );
};

