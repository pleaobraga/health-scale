// --- CONFIGURAÇÃO DE TURNOS ---
export interface ShiftDefinition {
  id: string
  name: string // Ex: "Plantão Diurno 12h", "Plantão 24h", "Sobreaviso 6h"
  code: string // Ex: "D12", "P24", "N12"
  startTime: string // Formato HH:mm (ex: "07:00")
  durationHours: number // Duração flexível em horas (ex: 6, 8, 12, 24)
  color: string // Cor para badge/célula no Tailwind (ex: "#3B82F6")
  enabledByDefault: boolean // Se o turno nasce ativo para novos meses
  createdAt: string
  updatedAt: string
}

// --- CONFIGURAÇÃO DO MOTOR DE REGRAS ---
export type RuleType =
  | 'MAX_SHIFTS_PER_PERIOD' // Limite de quantidade de turnos em um período (Dia, Semana, Mês)
  | 'MAX_HOURS_PER_PERIOD' // Limite de soma de horas trabalhadas em um período (Dia, Semana, Mês)
  | 'MIN_REST_HOURS' // Descanso mínimo obrigatório entre término de um turno e início do próximo
  | 'CONSECUTIVE_DAYS_LIMIT' // Limite de dias consecutivos de trabalho (ex: proibir D-1 / D+1)

export type PeriodScope = 'DAY' | 'WEEK' | 'MONTH'

export interface ShiftRule {
  id: string
  name: string
  description?: string
  type: RuleType
  enabledByDefault: boolean // Se a regra é ativada por padrão para novos meses
  severity: 'ERROR' | 'WARNING'
  parameters: {
    scope?: PeriodScope // Janela de avaliação: 'DAY', 'WEEK' ou 'MONTH'
    maxOccurrences?: number // Ex: máx 1 turno no mesmo 'DAY', máx 2 turnos na mesma 'WEEK'
    maxHours?: number // Ex: máx 24h em um mesmo 'DAY', máx 44h na mesma 'WEEK'
    minRestHours?: number // Janela mínima de descanso (ex: 12h, 24h, 36h)
    targetShiftIds?: string[] // IDs dos turnos aos quais a regra se aplica (vazio = aplica a todos)
    consecutiveDaysLimit?: number // Tolerância de dias contínuos (ex: 1 para proibir dias adjacentes)
  }
  createdAt: string
  updatedAt: string
}

// --- VIOLAÇÃO IDENTIFICADA ---
export interface RuleViolation {
  ruleId: string
  ruleName: string
  severity: 'ERROR' | 'WARNING'
  personId: string
  personName: string
  date: string // YYYY-MM-DD afetado
  shiftId?: string
  message: string // Mensagem explicativa contextualizada
}

// --- PERSISTÊNCIA MENSAL DO DOCUMENTO (schedules/{YYYY-MM}) ---
export interface MonthScheduleDocument {
  month: string // "YYYY-MM"
  shifts?: Record<
    string,
    {
      personId: string
      shiftDefinitionId: string
    }
  > // Chave: `${YYYY-MM-DD}_${shiftId}`
  assignments?: Record<string, string[]> // Backward-compatibility
  activePersonIds?: string[] // IDs dos profissionais vinculados a este mês
  activeShiftIds?: string[] // IDs dos turnos ativos aplicáveis para este mês
  activeRuleIds?: string[] // IDs das regras ativas aplicáveis para este mês
  updatedAt?: string
}

