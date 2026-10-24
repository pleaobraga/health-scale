import { useState } from 'react'

import { PersonCard } from './person-card'
import { SortablePersonList } from './sortable-person-list'
import { reorderPersonIds, sortByPersonOrder } from './use-person-order'

import type { Person } from '../../types'
import type { Meta, StoryObj } from '@storybook/react-vite'

const persons: Person[] = [
  { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
  { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
  { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
  { id: 'p4', name: 'Téc. Rafael Souza', color: '#f59e0b' },
]

function SortablePersonListDemo() {
  const [order, setOrder] = useState<string[]>([])
  const sorted = sortByPersonOrder(persons, order)

  return (
    <div className="w-80 p-3 space-y-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <SortablePersonList
        persons={sorted}
        onReorder={(activeId, overId) =>
          setOrder(reorderPersonIds(order, sorted.map((p) => p.id), activeId, overId))
        }
        renderPerson={(person, dragHandle) => (
          <PersonCard
            person={person}
            availableDaysCount={5}
            workingDaysCount={2}
            isHighlighted={false}
            onToggleHighlight={() => {}}
            onToggleScheduledHighlight={() => {}}
            onEdit={() => {}}
            onInsertAllDays={() => {}}
            dragHandle={dragHandle}
          />
        )}
      />
    </div>
  )
}

const meta: Meta<typeof SortablePersonList> = {
  title: 'Sidebar/SortablePersonList',
  component: SortablePersonList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SortablePersonList>

export const Default: Story = {
  render: () => <SortablePersonListDemo />,
}
