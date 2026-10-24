import { describe, expect, it } from 'vitest'

import { reorderListIds, sortByListOrder } from './list-order'

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('sortByListOrder', () => {
  it('sorts by the saved order and keeps unsorted items at the end in their original order', () => {
    expect(sortByListOrder(items, ['c', 'a']).map((i) => i.id)).toEqual(['c', 'a', 'b', 'd'])
  })

  it('keeps the original order without a saved order', () => {
    expect(sortByListOrder(items, []).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('uses the fallback comparator for items without a saved position', () => {
    const people = [
      { id: '1', name: 'Carla' },
      { id: '2', name: 'ana' },
      { id: '3', name: 'Bruno' },
    ]
    const byName = (x: { name: string }, y: { name: string }) =>
      x.name.localeCompare(y.name, 'pt-BR', { sensitivity: 'base' })

    expect(sortByListOrder(people, [], byName).map((p) => p.name)).toEqual(['ana', 'Bruno', 'Carla'])
    // Saved positions win; the rest is appended alphabetically
    expect(sortByListOrder(people, ['1'], byName).map((p) => p.name)).toEqual(['Carla', 'ana', 'Bruno'])
  })
})

describe('reorderListIds', () => {
  it('moves the item to the target position', () => {
    expect(reorderListIds(['a', 'b', 'c'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('keeps the positions of items outside the visible list', () => {
    expect(reorderListIds(['a', 'x', 'b', 'y', 'c'], ['a', 'b', 'c'], 'a', 'c')).toEqual([
      'b',
      'x',
      'c',
      'y',
      'a',
    ])
  })

  it('appends visible items that were not in the saved order yet', () => {
    expect(reorderListIds(['a'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('returns the same order when source and target are equal or unknown', () => {
    const order = ['a', 'b']
    expect(reorderListIds(order, ['a', 'b'], 'a', 'a')).toBe(order)
    expect(reorderListIds(order, ['a', 'b'], 'a', 'z')).toBe(order)
  })
})
