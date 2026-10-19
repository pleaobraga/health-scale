import {
  UploadCloud,
  FileText,
  Users,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Database,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import React, { use, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConfirmOverwriteModal } from './ConfirmOverwriteModal';
import { AuthContext } from '../../context/AuthContext';
import {
  validateAndParseBackup,
  restoreAppData,
  hasExistingLocalData,
} from '../../services/backupService';
import { CloudSyncService } from '../../services/cloudSyncService';
import { StorageService } from '../../services/storageService';
import { useScheduleStore } from '../../store/useScheduleStore';

import type { AppDataSnapshot } from '../../types';

export function ImportView() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = use(AuthContext);
  const isAdmin = auth?.isAdmin ?? false;

  const { pullCloudData } = useScheduleStore();
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [cloudFeedback, setCloudFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AppDataSnapshot | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isStorageEmpty, setIsStorageEmpty] = useState<boolean | null>(null);

  const handlePullCloudData = async () => {
    try {
      setIsPullingCloud(true);
      setCloudFeedback(null);

      // Auto-enable sync if not already enabled
      if (!CloudSyncService.isSyncEnabled()) {
        CloudSyncService.setSyncEnabled(true);
      }

      const result = await pullCloudData();
      if (result.success) {
        setCloudFeedback({
          type: 'success',
          message: `${result.message} Redirecionando para a escala...`,
        });
        setTimeout(() => {
          navigate('/calendario');
        }, 1200);
      } else {
        setCloudFeedback({
          type: 'error',
          message: result.message,
        });
        setTimeout(() => setCloudFeedback(null), 5000);
      }
    } catch {
      setCloudFeedback({
        type: 'error',
        message: 'Falha ao sincronizar dados com a nuvem.',
      });
      setTimeout(() => setCloudFeedback(null), 5000);
    } finally {
      setIsPullingCloud(false);
    }
  };

  // Check initial local storage state
  useEffect(() => {
    let mounted = true;
    hasExistingLocalData().then((hasData) => {
      if (mounted) {
        setIsStorageEmpty(!hasData);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleFileProcess = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsValidating(true);
    setParsedData(null);

    try {
      const snapshot = await validateAndParseBackup(file);
      setParsedData(snapshot);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado ao processar o arquivo de backup.';
      setErrorMessage(message);
      setSelectedFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setParsedData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartZero = () => {
    // Clear storage and store to start clean
    StorageService.savePersons([]);
    StorageService.saveAssignments({});
    StorageService.saveMonthParticipants({});
    StorageService.saveAvailabilities([]);
    StorageService.saveEvents([]);

    useScheduleStore.setState({
      persons: [],
      monthParticipants: {},
      assignments: {},
      savedAssignments: {},
      availabilities: [],
      events: [],
      currentView: 'people',
      hasUnsavedChanges: false,
      isEditMode: false,
    });

    if (navigate) {
      navigate('/pessoas');
    }
  };

  const handleRestoreClick = async () => {
    if (!parsedData) return;

    const hasData = await hasExistingLocalData();
    if (hasData) {
      setIsConfirmModalOpen(true);
    } else {
      executeRestore();
    }
  };

  const executeRestore = async () => {
    if (!parsedData) return;

    try {
      setIsRestoring(true);
      await restoreAppData(parsedData);
      setIsConfirmModalOpen(false);
      if (navigate) {
        navigate('/');
      }
    } catch (err) {
      console.error('Falha ao restaurar dados:', err);
      setErrorMessage('Falha ao aplicar os dados do backup. Tente novamente.');
      setIsRestoring(false);
    }
  };

  const formatExportedDate = (isoStr?: string) => {
    if (!isoStr) return 'Data não informada';
    try {
      const date = new Date(isoStr);
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar">
      <div className="w-full max-w-4xl space-y-6">
        {/* Onboarding Welcome Banner (Highlighted when system is empty or as welcome) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isStorageEmpty
                  ? 'Configuração Inicial / Boas-vindas'
                  : 'Restauração de Backup'}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Bem-vindo ao Gerenciador de Escalas Mensais
              </h2>
              <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                Restaure um arquivo de backup (.json) para recuperar instantaneamente toda a sua
                equipe, disponibilidades, calendários e eventos. Ou se preferir, inicie um novo
                cadastro manual do zero.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {isAdmin && (
                <button
                  type="button"
                  onClick={handlePullCloudData}
                  disabled={isPullingCloud}
                  data-testid="banner-pull-cloud-button"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/20 font-bold text-sm backdrop-blur-md shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isPullingCloud ? 'animate-spin' : ''}`} />
                  <span>{isPullingCloud ? 'Buscando...' : 'Puxar da Nuvem'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStartZero}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all active:scale-98"
              >
                <span>Começar do zero</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Admin Cloud Pull Card */}
        {isAdmin && (
          <div
            data-testid="admin-cloud-pull-card"
            className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-3xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Puxar Dados da Nuvem (Firestore)
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Recupere instantaneamente a escala do mês ativo e os profissionais salvos no Firestore para este dispositivo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePullCloudData}
                disabled={isPullingCloud}
                data-testid="import-pull-cloud-button"
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isPullingCloud ? 'animate-spin' : ''}`} />
                <span>{isPullingCloud ? 'Buscando da nuvem...' : 'Puxar Dados da Nuvem'}</span>
              </button>
            </div>

            {cloudFeedback && (
              <div
                data-testid="cloud-feedback-banner"
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-semibold ${
                  cloudFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60'
                }`}
              >
                {cloudFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{cloudFeedback.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Dropzone Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Selecione o arquivo de backup
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Arraste seu arquivo JSON ou clique abaixo para selecionar do seu computador.
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              data-testid="backup-file-input"
            />

            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                selectedFile
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {selectedFile ? (
                <FileText className="w-8 h-8 stroke-[2.2]" />
              ) : (
                <UploadCloud className="w-8 h-8 stroke-[2.2]" />
              )}
            </div>

            <div>
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para validação
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-indigo-600 dark:text-indigo-400 underline">
                      Clique para selecionar
                    </span>{' '}
                    ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Suporta arquivos .json gerados pelo Gerenciador de Escalas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validation Feedback & Error Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-1">
                <span className="font-bold">Erro ao validar arquivo:</span>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {isValidating && (
            <div className="flex items-center justify-center gap-2.5 py-4 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
              <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Lendo e validando estrutura do backup...
            </div>
          )}

          {/* Data Preview Section (Visible when parsedData is ready) */}
          {parsedData && !isValidating && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prévia do Backup Válido
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>

              {/* Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Data do Backup
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {formatExportedDate(parsedData.exportedAt)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Profissionais
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {parsedData.people.length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Meses Configurados
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {Object.keys(parsedData.monthParticipants || {}).length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Eventos
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {parsedData.events.length}
                  </div>
                </div>
              </div>

              {/* People Sample Badges */}
              {parsedData.people.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Equipe incluída ({parsedData.people.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.people.slice(0, 10).map((person) => (
                      <span
                        key={person.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: person.color || '#3b82f6' }}
                        />
                        {person.name}
                      </span>
                    ))}
                    {parsedData.people.length > 10 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                        +{parsedData.people.length - 10} outros
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isRestoring}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRestoreClick}
                  disabled={isRestoring}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Restaurar Backup</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal when overwriting existing data */}
      <ConfirmOverwriteModal
        isOpen={isConfirmModalOpen}
        onConfirm={executeRestore}
        onCancel={() => setIsConfirmModalOpen(false)}
        isRestoring={isRestoring}
      />
    </div>
  );
};
