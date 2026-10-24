import { useState } from 'react'

import { SortableList } from './sortable-list'
import { reorderListIds, sortByListOrder } from '../../utils/list-order'

import type { Meta, StoryObj } from '@storybook/react-vite'

interface DemoItem {
  id: string
  name: string
  color: string
}

const demoItems: DemoItem[] = [
  { id: '1', name: 'Dra. Camila Santos', color: '#3b82f6' },
  { id: '2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
  { id: '3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
  { id: '4', name: 'Téc. Rafael Souza', color: '#f59e0b' },
  { id: '5', name: 'Dra. Helena Costa', color: '#ef4444' },
  { id: '6', name: 'Enf. Marcos Dias', color: '#06b6d4' },
]

function SortableListDemo({ layout }: { layout: 'list' | 'grid' }) {
  const [order, setOrder] = useState<string[]>([])
  const sorted = sortByListOrder(demoItems, order)

  return (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'
          : 'w-80 p-3 space-y-1.5'
      }
    >
      <SortableList
        items={sorted}
        layout={layout}
        getItemLabel={(item) => item.name}
        onReorder={(activeId, overId) =>
          setOrder(reorderListIds(order, sorted.map((i) => i.id), activeId, overId))
        }
        renderItem={(item, dragHandle) => (
          <div className="h-full flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {dragHandle}
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}</span>
          </div>
        )}
      />
    </div>
  )
}

const meta: Meta<typeof SortableListDemo> = {
  title: 'Common/SortableList',
  component: SortableListDemo,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SortableListDemo>

export const VerticalList: Story = {
  args: { layout: 'list' },
}

export const Grid: Story = {
  args: { layout: 'grid' },
}
