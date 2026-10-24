import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Announcements, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import type { ReactNode } from 'react'

export interface SortableListProps<T extends { id: string }> {
  items: T[]
  /** `list` for vertical stacks, `grid` for multi-column card grids */
  layout?: 'list' | 'grid'
  /** Accessible name of each item, used by the drag handle and screen reader announcements */
  getItemLabel: (item: T) => string
  onReorder: (activeId: string, overId: string) => void
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode
}

interface SortableItemProps<T extends { id: string }> {
  item: T
  label: string
  layout: 'list' | 'grid'
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode
}

function SortableItem<T extends { id: string }>({
  item,
  label,
  layout,
  renderItem,
}: SortableItemProps<T>) {
  const { t } = useTranslation(['common'])
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const handleLabel = t('common:reorder.handle', { name: label })

  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      title={handleLabel}
      aria-label={handleLabel}
      data-testid={`drag-handle-${item.id}`}
      className="-ml-1 p-0.5 rounded-md text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 print:hidden"
    >
      <GripVertical className="w-3.5 h-3.5" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      data-testid={`sortable-item-${item.id}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${layout === 'grid' ? 'h-full' : ''} ${
        isDragging ? 'relative z-10 opacity-90 drop-shadow-lg' : ''
      }`}
    >
      {renderItem(item, dragHandle)}
    </div>
  )
}

export function SortableList<T extends { id: string }>({
  items,
  layout = 'list',
  getItemLabel,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const { t } = useTranslation(['common'])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const getLabel = (id: UniqueIdentifier | undefined) => {
    const item = items.find((i) => i.id === id)
    return item ? getItemLabel(item) : ''
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('common:reorder.start', { name: getLabel(active.id) }),
    onDragOver: ({ active, over }) =>
      over
        ? t('common:reorder.over', { name: getLabel(active.id), target: getLabel(over.id) })
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t('common:reorder.end', { name: getLabel(active.id), target: getLabel(over.id) })
        : undefined,
    onDragCancel: ({ active }) => t('common:reorder.cancel', { name: getLabel(active.id) }),
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t('common:reorder.instructions') },
      }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem
            key={item.id}
            item={item}
            label={getItemLabel(item)}
            layout={layout}
            renderItem={renderItem}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
