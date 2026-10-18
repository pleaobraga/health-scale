import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  HardDrive,
  Download,
  Upload,
  Check,
  Info,
  Calendar,
  Users,
} from 'lucide-react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { exportAppData } from '../../services/backupService';
import { NavLink } from 'react-router-dom';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, persons, assignments, events } =
    useScheduleStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const totalAssignedDays = Object.keys(assignments).filter(
    (k) => (assignments[k] || []).length > 0,
  ).length;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAppData();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Erro ao exportar backup nas configurações:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      data-testid="settings-view"
      className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar"
    >
      <div className="w-full max-w-4xl space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Configurações Gerais
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preferências do sistema, armazenamento local e manutenção de dados
            </p>
          </div>
        </div>

        {/* Section 1: Appearance Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Aparência e Tema
          </h2>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Modo Escuro / Claro
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isDarkMode ? 'O tema escuro está ativado atualmente' : 'O tema claro está ativado atualmente'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
            >
              {isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            </button>
          </div>
        </div>

        {/* Section 2: Local Storage Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Resumo do Armazenamento Local
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Profissionais</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {persons.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {persons.filter((p) => p.active !== false).length} ativos
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Dias com Escala</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {totalAssignedDays}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dias com alocações salvas
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Eventos do Mês</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {events.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Avisos e plantões registrados
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Backup & Restore Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Backup e Segurança de Dados
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {exportSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{exportSuccess ? 'Backup baixado com sucesso!' : 'Baixar Cópia de Segurança (.json)'}</span>
            </button>

            <NavLink
              to="/importar"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Importar ou Restaurar Dados</span>
            </NavLink>
          </div>
        </div>

        {/* Section 4: System Information */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              Gerenciador de Escalas Mensais • v1.0.0
            </p>
            <p>
              Aplicação Single Page Application (SPA) 100% client-side com persistência local em IndexedDB/LocalStorage e roteamento HashRouter compatível com GitHub Pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

