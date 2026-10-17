import type { Meta, StoryObj } from '@storybook/react-vite';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { useScheduleStore } from '../../store/useScheduleStore';

const meta: Meta<typeof UnsavedChangesModal> = {
  title: 'Modals/UnsavedChangesModal',
  component: UnsavedChangesModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof UnsavedChangesModal>;

export const DefaultOpen: Story = {
  render: () => {
    useScheduleStore.setState({
      isUnsavedModalOpen: true,
      isEditMode: true,
      hasUnsavedChanges: true,
    });
    return <UnsavedChangesModal />;
  },
};

