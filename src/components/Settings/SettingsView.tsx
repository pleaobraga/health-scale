import {
  AlertCircle,
  Calendar,
  Check,
  Cloud,
  CloudOff,
  Download,
  HardDrive,
  Info,
  Moon,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sun,
  Upload,
  Users,
} from 'lucide-react'
import { use, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { AuthContext } from '../../context/AuthContext'
import { exportAppData } from '../../services/backupService'
import { CloudSyncService } from '../../services/cloudSyncService'
import { useScheduleStore } from '../../store/useScheduleStore'

export function SettingsView() {
  const {
    isDarkMode,
    toggleDarkMode,
    persons,
    assignments,
    events,
    pullCloudData,
  } = useScheduleStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [pullFeedback, setPullFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const auth = use(AuthContext)
  // Show admin cloud sync controls if authenticated as admin (or in isolated test/dev)
  const isAdmin = auth ? auth.isAdmin : true

  const [syncEnabled, setSyncEnabled] = useState<boolean>(() =>
    CloudSyncService.isSyncEnabled(),
  )

  const totalAssignedDays = Object.keys(assignments).filter(
    (k) => (assignments[k] || []).length > 0,
  ).length

  const handleToggleSync = () => {
    const nextState = !syncEnabled
    setSyncEnabled(nextState)
    CloudSyncService.setSyncEnabled(nextState)
  }

  const handlePullCloudData = async () => {
    try {
      setIsPulling(true)
      setPullFeedback(null)

      // Auto-enable sync toggle on deliberate pull action if previously disabled
      if (!syncEnabled) {
        setSyncEnabled(true)
        CloudSyncService.setSyncEnabled(true)
      }

      const result = await pullCloudData()
      setPullFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      })
      setTimeout(() => setPullFeedback(null), 5000)
    } catch {
      setPullFeedback({
        type: 'error',
        message: 'Falha ao sincronizar dados com a nuvem.',
      })
      setTimeout(() => setPullFeedback(null), 5000)
    } finally {
      setIsPulling(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportAppData()
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2500)
    } catch (err) {
      console.error('Erro ao exportar backup nas configurações:', err)
    } finally {
      setIsExporting(false)
    }
  }

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
              Preferências do sistema, persistência e sincronização de dados
            </p>
          </div>
        </div>

        {/* Section 1: Administrator Cloud Sync Switch & On-Demand Pull Button */}
        {isAdmin && (
          <div
            data-testid="admin-sync-card"
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sincronização na Nuvem (Firestore)
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recurso exclusivo do Administrador • Plano Spark Custo Zero
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                data-testid="sync-status-badge"
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition ${
                  syncEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {syncEnabled ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Nuvem Ativa</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                    <span>Apenas Local</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  Quando a sincronização está ativada,{' '}
                  <strong>todas as alterações salvas</strong> (escala e
                  profissionais) são gravadas localmente e enviadas à nuvem.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Quando desativada, a aplicação opera 100% no cliente sem
                  efetuar chamadas ao Firestore.
                </p>
              </div>

              {/* Toggle switch button */}
              <button
                type="button"
                role="switch"
                aria-checked={syncEnabled}
                onClick={handleToggleSync}
                data-testid="toggle-sync-button"
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  syncEnabled
                    ? 'bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className="sr-only">Ativar sincronização na nuvem</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    syncEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pull Cloud Data Button & Feedback (ALWAYS VISIBLE in Admin Sync Card) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Puxar Dados da Nuvem para o Dispositivo
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recarrega a escala do mês ativo e os profissionais salvos no
                    Firestore para este computador
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePullCloudData}
                  disabled={isPulling}
                  data-testid="pull-cloud-data-button"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 shrink-0"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isPulling
                      ? 'Buscando da nuvem...'
                      : 'Puxar Dados da Nuvem'}
                  </span>
                </button>
              </div>

              {pullFeedback && (
                <div
                  data-testid="pull-feedback-banner"
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                    pullFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  {pullFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{pullFeedback.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 2: Appearance Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Aparência e Tema
          </h2>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Modo Escuro / Claro
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isDarkMode
                    ? 'O tema escuro está ativado atualmente'
                    : 'O tema claro está ativado atualmente'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
            >
              {isDarkMode
                ? 'Alternar para Modo Claro'
                : 'Alternar para Modo Escuro'}
            </button>
          </div>
        </div>

        {/* Section 3: Local Storage Summary */}
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

        {/* Section 4: Backup & Restore Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Backup e Segurança de Dados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {exportSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {exportSuccess
                  ? 'Backup baixado com sucesso!'
                  : 'Baixar Cópia (.json)'}
              </span>
            </button>

            <NavLink
              to="/importar"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Importar ou Restaurar</span>
            </NavLink>
          </div>
        </div>

        {/* Section 5: System Information */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              Gerenciador de Escalas Mensais • v1.0.0
            </p>
            <p>
              Aplicação Single Page Application (SPA) 100% client-side com
              persistência local em IndexedDB/LocalStorage, autenticação
              obrigatória via Firebase Auth e sincronização sob demanda no plano
              Spark do Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
