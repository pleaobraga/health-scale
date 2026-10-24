import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { reorderPersonIds, sortByPersonOrder, usePersonOrder } from './use-person-order'
import { StorageService } from '../../services/storage-service'

const people = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('sortByPersonOrder', () => {
  it('ordena pela ordem salva e mantém os não ordenados no final na ordem original', () => {
    expect(sortByPersonOrder(people, ['c', 'a']).map((p) => p.id)).toEqual(['c', 'a', 'b', 'd'])
  })

  it('mantém a ordem original quando não há ordem salva', () => {
    expect(sortByPersonOrder(people, []).map((p) => p.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('reorderPersonIds', () => {
  it('move o item para a posição do alvo', () => {
    expect(reorderPersonIds(['a', 'b', 'c'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('preserva as posições de pessoas fora da lista visível (outros meses)', () => {
    // x and y belong to other months and must stay in their slots
    expect(reorderPersonIds(['a', 'x', 'b', 'y', 'c'], ['a', 'b', 'c'], 'a', 'c')).toEqual([
      'b',
      'x',
      'c',
      'y',
      'a',
    ])
  })

  it('inclui no final pessoas visíveis que ainda não estavam na ordem salva', () => {
    expect(reorderPersonIds(['a'], ['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('retorna a mesma ordem quando origem e destino são iguais', () => {
    const order = ['a', 'b']
    expect(reorderPersonIds(order, ['a', 'b'], 'a', 'a')).toBe(order)
  })
})

describe('usePersonOrder', () => {
  it('carrega e salva a ordem apenas no localStorage', () => {
    StorageService.savePersonOrder(['b', 'a'])
    const { result } = renderHook(() => usePersonOrder())
    expect(result.current.personOrder).toEqual(['b', 'a'])

    act(() => result.current.handleReorder(['b', 'a', 'c'], 'c', 'b'))

    expect(result.current.personOrder).toEqual(['c', 'b', 'a'])
    expect(StorageService.getPersonOrder()).toEqual(['c', 'b', 'a'])
  })
})
