import { arrayMove } from '@dnd-kit/sortable'

/**
 * Sorts items by a saved id order. Items missing from the order go after the
 * ordered ones, sorted by `fallbackCompare` (or kept in their original order).
 */
export function sortByListOrder<T extends { id: string }>(
  items: T[],
  order: string[],
  fallbackCompare?: (a: T, b: T) => number,
): T[] {
  const positions = new Map(order.map((id, index) => [id, index]))
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const posA = positions.get(a.item.id)
      const posB = positions.get(b.item.id)
      if (posA !== undefined && posB !== undefined) return posA - posB
      if (posA !== undefined) return -1
      if (posB !== undefined) return 1
      return fallbackCompare
        ? fallbackCompare(a.item, b.item) || a.originalIndex - b.originalIndex
        : a.originalIndex - b.originalIndex
    })
    .map(({ item }) => item)
}

/**
 * Moves `activeId` to the position of `overId` inside `visibleIds` and merges the
 * result back into the saved order: ids outside `visibleIds` (e.g. people not
 * linked to the current month) keep their slots untouched.
 */
export function reorderListIds(
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
