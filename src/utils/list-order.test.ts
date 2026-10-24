import { describe, expect, it } from 'vitest'

import { reorderListIds, sortByListOrder } from './list-order'

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('sortByListOrder', () => {
  it('ordena pela ordem salva e mantém os não ordenados no final na ordem original', () => {
    expect(sortByListOrder(items, ['c', 'a']).map((i) => i.id)).toEqual(['c', 'a', 'b', 'd'])
  })

  it('mantém a ordem original quando não há ordem salva', () => {
    expect(sortByListOrder(items, []).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('usa o comparador padrão para os itens sem posição salva', () => {
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
  it('move o item para a posição do alvo', () => {
    expect(reorderListIds(['a', 'b', 'c'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('preserva as posições de itens fora da lista visível', () => {
    expect(reorderListIds(['a', 'x', 'b', 'y', 'c'], ['a', 'b', 'c'], 'a', 'c')).toEqual([
      'b',
      'x',
      'c',
      'y',
      'a',
    ])
  })

  it('inclui no final itens visíveis que ainda não estavam na ordem salva', () => {
    expect(reorderListIds(['a'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('retorna a mesma ordem quando origem e destino são iguais ou desconhecidos', () => {
    const order = ['a', 'b']
    expect(reorderListIds(order, ['a', 'b'], 'a', 'a')).toBe(order)
    expect(reorderListIds(order, ['a', 'b'], 'a', 'z')).toBe(order)
  })
})
