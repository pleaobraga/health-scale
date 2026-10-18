import React from 'react';
import { Routes, Route, Navigate, MemoryRouter, HashRouter } from 'react-router-dom';
import { RootLayout } from '../components/Layout/RootLayout';
import { CalendarView } from '../components/Calendar/CalendarView';
import { PeopleManagementView } from '../components/PeopleManagement/PeopleManagementView';
import { ImportView } from '../components/Import/ImportView';
import { SettingsView } from '../components/Settings/SettingsView';

/**
 * Main application routes tree.
 * Renders RootLayout with HoverSidebar and Outlet for child views.
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Rota Raiz / Calendário */}
        <Route index element={<CalendarView />} />
        {/* Rota alias /calendario */}
        <Route path="calendario" element={<CalendarView />} />
        {/* Rota de Gestão Global de Pessoas */}
        <Route path="pessoas" element={<PeopleManagementView />} />
        {/* Rota de Importação de Dados */}
        <Route path="importar" element={<ImportView />} />
        {/* Rota Extensível: Configurações Gerais */}
        <Route path="configuracoes" element={<SettingsView />} />
        {/* Rota Fallback / 404 Interno: Redireciona para #/ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

/**
 * Production HashRouter wrapper component.
 * URLs follow /#/rota pattern, preventing 404s on GitHub Pages static hosting.
 */
export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

/**
 * Test wrapper using MemoryRouter for deterministic testing with Vitest.
 */
export const TestAppRouter: React.FC<{ initialEntries?: string[] }> = ({
  initialEntries = ['/'],
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes />
    </MemoryRouter>
  );
};
