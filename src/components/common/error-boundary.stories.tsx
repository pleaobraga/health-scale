import { ErrorBoundary } from './error-boundary';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Common/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

function BuggyComponent(): ReactNode {
  throw new Error('Falha de demonstração capturada pelo ErrorBoundary');
}

export const ErrorState: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  ),
};

export const NormalState: Story = {
  render: () => (
    <ErrorBoundary>
      <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200">
        Componente íntegro renderizado com sucesso sem erros.
      </div>
    </ErrorBoundary>
  ),
};
