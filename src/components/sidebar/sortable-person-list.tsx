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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Person } from '../../types'
import type { Announcements, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import type { ReactNode } from 'react'

export interface SortablePersonListProps {
  persons: Person[]
  onReorder: (activeId: string, overId: string) => void
  renderPerson: (person: Person, dragHandle: ReactNode) => ReactNode
}

interface SortablePersonItemProps {
  person: Person
  renderPerson: (person: Person, dragHandle: ReactNode) => ReactNode
}

function SortablePersonItem({ person, renderPerson }: SortablePersonItemProps) {
  const { t } = useTranslation(['people'])
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id })

  const handleLabel = t('people:sidebar.reorder.handle', { name: person.name })

  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      title={handleLabel}
      aria-label={handleLabel}
      data-testid={`person-drag-handle-${person.id}`}
      className="-ml-1 p-0.5 rounded-md text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <GripVertical className="w-3.5 h-3.5" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      data-testid={`sortable-person-${person.id}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-90 drop-shadow-lg' : ''}
    >
      {renderPerson(person, dragHandle)}
    </div>
  )
}

export function SortablePersonList({ persons, onReorder, renderPerson }: SortablePersonListProps) {
  const { t } = useTranslation(['people'])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const getName = (id: UniqueIdentifier | undefined) =>
    persons.find((p) => p.id === id)?.name ?? ''

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('people:sidebar.reorder.start', { name: getName(active.id) }),
    onDragOver: ({ active, over }) =>
      over
        ? t('people:sidebar.reorder.over', { name: getName(active.id), target: getName(over.id) })
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t('people:sidebar.reorder.end', { name: getName(active.id), target: getName(over.id) })
        : undefined,
    onDragCancel: ({ active }) => t('people:sidebar.reorder.cancel', { name: getName(active.id) }),
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
        screenReaderInstructions: { draggable: t('people:sidebar.reorder.instructions') },
      }}
    >
      <SortableContext items={persons.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {persons.map((person) => (
          <SortablePersonItem key={person.id} person={person} renderPerson={renderPerson} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
