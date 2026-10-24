import { useState } from 'react'

import { StorageService } from '../services/storage-service'
import { reorderListIds } from '../utils/list-order'

import type { ListOrderId } from '../services/storage-service'

/**
 * Drag-and-drop display order of a list. Persisted only in this device's
 * localStorage (per guest profile / user) and never synced to Firestore.
 */
export function useListOrder(listId: ListOrderId) {
  const [order, setOrder] = useState<string[]>(() => StorageService.getListOrder(listId))

  const handleReorder = (visibleIds: string[], activeId: string, overId: string) => {
    const nextOrder = reorderListIds(order, visibleIds, activeId, overId)
    if (nextOrder === order) return
    setOrder(nextOrder)
    StorageService.saveListOrder(listId, nextOrder)
  }

  return { order, handleReorder }
}
