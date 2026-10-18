import { ValidationPanel } from './ValidationPanel';
import { useScheduleStore } from '../../store/useScheduleStore';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ValidationPanel> = {
  title: 'Validation/ValidationPanel',
  component: ValidationPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ValidationPanel>;

export const DefaultNotValidated: Story = {
  render: () => {
    useScheduleStore.setState({
      hasValidated: false,
      validationErrors: [],
      saveFeedback: null,
    });
    return <ValidationPanel />;
  },
};

export const AllValidState: Story = {
  render: () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [],
      saveFeedback: 'Escala salva com sucesso no armazenamento local!',
    });
    return <ValidationPanel />;
  },
};

export const WithViolationsAndWarnings: Story = {
  render: () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [
        {
          id: 'err-1',
          rule: 'consecutive_days',
          severity: 'error',
          date: '2026-10-02',
          message: 'Descanso violado: Dra. Camila Santos foi escalada em dias seguidos (01/10/2026 e 02/10/2026). É obrigatório pelo menos 1 dia de descanso.',
        },
        {
          id: 'err-2',
          rule: 'weekly_limit',
          severity: 'error',
          date: '2026-10-08',
          message: 'Limite semanal excedido: Dr. Lucas Oliveira foi escalado 3 vezes na semana de 04/10/2026 a 10/10/2026. O limite máximo é de 2 escalas por semana.',
        },
        {
          id: 'warn-1',
          rule: 'empty_day',
          severity: 'warning',
          date: '2026-10-18',
          message: 'Dia sem responsável: o dia 18/10/2026 está sem nenhuma pessoa escalada.',
        },
      ],
      saveFeedback: null,
    });
    return <ValidationPanel />;
  },
};

