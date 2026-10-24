import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useListOrder } from './use-list-order'
import { StorageService } from '../services/storage-service'

describe('useListOrder', () => {
  it('loads and saves the list order in localStorage only', () => {
    StorageService.saveListOrder('shifts', ['b', 'a'])
    const { result } = renderHook(() => useListOrder('shifts'))
    expect(result.current.order).toEqual(['b', 'a'])

    act(() => result.current.handleReorder(['b', 'a', 'c'], 'c', 'b'))

    expect(result.current.order).toEqual(['c', 'b', 'a'])
    expect(StorageService.getListOrder('shifts')).toEqual(['c', 'b', 'a'])
    // Other lists are untouched
    expect(StorageService.getListOrder('rules')).toEqual([])
  })
})
