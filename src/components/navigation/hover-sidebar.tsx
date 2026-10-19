import {
  CalendarDays,
  Check,
  Cloud,
  CloudOff,
  Download,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Upload,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import React, { use, useState } from 'react';
import { NavLink, useInRouterContext } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import { exportAppData } from '../../services/backup-service';
import { CloudSyncService } from '../../services/cloud-sync-service';
import { useScheduleStore } from '../../store/use-schedule-store';

import type { NavigationTab } from '../../types';

export function HoverSidebar() {
  const { currentView, setCurrentView, isDarkMode, toggleDarkMode } =
    useScheduleStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const inRouter = useInRouterContext();

  const auth = use(AuthContext);
  const user = auth?.user;
  const isAdmin = auth?.isAdmin ?? false;
  const isGuest = auth?.isGuest ?? false;
  const isSyncEnabled = CloudSyncService.isSyncEnabled();

  const navItems: {
    id: NavigationTab;
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
  }[] = [
    {
      id: 'calendar',
      path: '/',
      label: 'Calendário de Escalas',
      icon: CalendarDays,
      end: true,
    },
    {
      id: 'people',
      path: '/pessoas',
      label: 'Gerenciar Pessoas',
      icon: Users,
      end: false,
    },
    {
      id: 'import',
      path: '/importar',
      label: 'Importar Dados',
      icon: Upload,
      end: false,
    },
    {
      id: 'settings',
      path: '/configuracoes',
      label: 'Configurações',
      icon: Settings,
      end: false,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'users',
      path: '/usuarios',
      label: 'Gestão de Usuários',
      icon: ShieldCheck,
      end: false,
    });
  }

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

  const handleLogout = async () => {
    try {
      if (auth?.logout) {
        await auth.logout();
      }
    } catch (err) {
      console.error('Erro ao realizar logout:', err);
    }
  };

  return (
    <>
      {/* 1. Mobile Top Header (Screens smaller than 768px: < md) */}
      <header
        data-testid="mobile-header"
        className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 shadow-xs md:hidden select-none transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <CalendarDays className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              Escalas Mensais
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              HealthSchedule
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span
              title={isSyncEnabled ? 'Nuvem Ativa' : 'Apenas Local'}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                isSyncEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {isSyncEnabled ? (
                <Cloud className="w-3.5 h-3.5" />
              ) : (
                <CloudOff className="w-3.5 h-3.5" />
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            title="Abrir menu"
            aria-label="Abrir menu"
            data-testid="mobile-menu-button"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Mobile Full-Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          data-testid="mobile-fullscreen-menu"
          className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col justify-between p-5 overflow-y-auto animate-in fade-in duration-200 md:hidden text-slate-900 dark:text-slate-100"
        >
          {/* Top Bar of Mobile Menu */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Escalas Mensais
                  </h2>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    HealthSchedule
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Fechar menu"
                aria-label="Fechar menu"
                data-testid="mobile-menu-close"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User identification badge in mobile menu */}
            {user && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || user.email || 'Convidado'}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {isAdmin ? 'Administrador' : isGuest ? 'Convidado' : 'Profissional'}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isSyncEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {isSyncEnabled ? 'Nuvem Ativa' : 'Apenas Local'}
                  </span>
                )}
              </div>
            )}

            {/* Navigation Items in Full Screen */}
            <nav
              className="py-5 space-y-2.5"
              aria-label="Navegação em tela cheia"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentView === item.id;

                if (inRouter) {
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.end}
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      title={item.label}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base transition-all ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                        }`
                      }
                    >
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    title={item.label}
                    aria-label={item.label}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions in Full Screen */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            {/* Immediate Action: Exportar Dados */}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              title="Exportar Dados"
              aria-label="Exportar Dados"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition disabled:opacity-50"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                {exportSuccess ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
              <span>
                {exportSuccess ? 'Exportado com sucesso!' : 'Exportar Dados'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={
                isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'
              }
              aria-label={
                isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'
              }
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <span>
                {isDarkMode
                  ? 'Mudar para Modo Claro'
                  : 'Mudar para Modo Escuro'}
              </span>
            </button>

            {/* Logout button */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da Conta"
                aria-label="Sair da Conta"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm font-bold shadow-xs hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair da Conta</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Desktop / Tablet Fixed Hover Sidebar (Screens >= 768px: md+) */}
      <aside
        data-testid="hover-sidebar"
        className="group/sidebar fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between transition-all duration-300 ease-in-out z-40 w-16 hover:w-64 shrink-0 shadow-sm overflow-hidden select-none"
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
                HealthSchedule
              </span>
            </div>
          </div>

          {/* Cloud Sync indicator for admin */}
          {isAdmin && (
            <div className="px-2.5 pt-2">
              <div
                title={isSyncEnabled ? 'Nuvem Ativa' : 'Apenas Local'}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                  isSyncEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isSyncEnabled ? (
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CloudOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                  {isSyncEnabled ? 'Nuvem Ativa' : 'Apenas Local'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav
            className="p-2 space-y-1.5"
            aria-label="Menu Principal"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentView === item.id;

              if (inRouter) {
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.end}
                    onClick={() => setCurrentView(item.id)}
                    title={item.label}
                    aria-label={item.label}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent font-medium'
                      }`
                    }
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  </NavLink>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                    isSelected
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

        {/* Bottom Section: Actions, User, Theme Toggle & Logout */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
          {/* User profile identifier (collapsed: icon, expanded: email + role) */}
          {user && (
            <div
              title={user.displayName || user.email || 'Usuário autenticado'}
              className="flex items-center gap-3 px-2 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 text-xs overflow-hidden"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden min-w-0">
                <p className="font-bold truncate text-[11px] leading-tight">
                  {user.displayName || user.email || 'Convidado'}
                </p>
                <span className="text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                  {isAdmin ? 'Administrador' : isGuest ? 'Convidado' : 'Profissional'}
                </span>
              </div>
            </div>
          )}


          {/* Immediate Action: Exportar Dados */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            title="Exportar Dados"
            aria-label="Exportar Dados"
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
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
            title={
              isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'
            }
            aria-label={
              isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'
            }
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
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

          {/* Logout button */}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sair da Conta"
              aria-label="Sair da Conta"
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-2xs transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                Sair da Conta
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
