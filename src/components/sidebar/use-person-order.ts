import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'

import { StorageService } from '../../services/storage-service'

/**
 * Sorts items by the saved person order. Items missing from the order keep
 * their original relative position and go after the ordered ones.
 */
export function sortByPersonOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  const positions = new Map(order.map((id, index) => [id, index]))
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const posA = positions.get(a.item.id)
      const posB = positions.get(b.item.id)
      if (posA !== undefined && posB !== undefined) return posA - posB
      if (posA !== undefined) return -1
      if (posB !== undefined) return 1
      return a.originalIndex - b.originalIndex
    })
    .map(({ item }) => item)
}

/**
 * Moves `activeId` to the position of `overId` inside `visibleIds` and merges the
 * result back into the global order: people outside `visibleIds` (e.g. not linked
 * to the current month) keep their slots untouched.
 */
export function reorderPersonIds(
  order: string[],
  visibleIds: string[],
  activeId: string,
  overId: string,
): string[] {
  const from = visibleIds.indexOf(activeId)
  const to = visibleIds.indexOf(overId)
  if (from === -1 || to === -1 || from === to) return order

  const reorderedVisible = arrayMove(visibleIds, from, to)
  const visibleSet = new Set(visibleIds)
  const fullOrder = [...order, ...visibleIds.filter((id) => !order.includes(id))]

  let nextVisible = 0
  return fullOrder.map((id) => (visibleSet.has(id) ? reorderedVisible[nextVisible++] : id))
}

/**
 * Person card order for the month panel. Persisted only in this device's
 * localStorage (per guest profile / user) and never synced to Firestore.
 */
export function usePersonOrder() {
  const [personOrder, setPersonOrder] = useState<string[]>(() => StorageService.getPersonOrder())

  const handleReorder = (visibleIds: string[], activeId: string, overId: string) => {
    const nextOrder = reorderPersonIds(personOrder, visibleIds, activeId, overId)
    if (nextOrder === personOrder) return
    setPersonOrder(nextOrder)
    StorageService.savePersonOrder(nextOrder)
  }

  return { personOrder, handleReorder }
}
