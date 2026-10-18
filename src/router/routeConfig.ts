export interface RouteItemConfig {
  path: string;
  label: string;
}

/**
 * Route metadata mapping for inspection and extensibility.
 */
export const routeConfig: RouteItemConfig[] = [
  { path: '/', label: 'Calendário de Escalas' },
  { path: '/calendario', label: 'Calendário de Escalas (Alias)' },
  { path: '/pessoas', label: 'Gerenciar Pessoas' },
  { path: '/importar', label: 'Importar Dados' },
  { path: '/configuracoes', label: 'Configurações Gerais' },
];

