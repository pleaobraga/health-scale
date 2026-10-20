import { beforeEach, describe, expect, it, vi } from 'vitest'

import demoEnJson from '../../../public/demo/demo-en.json'
import demoJson from '../../../public/demo/demo.json'
import { i18n } from '../../i18n'
import { useScheduleStore } from '../../store/use-schedule-store'
import { StorageService } from '../storage-service'
import {
  getDaysInMonth,
  getRelativeMonths,
  isEnglishLanguage,
  isGuestDataEmpty,
  loadGuestSeedData,
  resolveSeedUrl,
  transformSeedData,
} from './guestSeedLoader'

import type { AppDataSnapshot, CalendarEvent, MonthlyAvailability } from '../../types'

describe('guestSeedLoader', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
    useScheduleStore.getState().clearAllLocalData()
  })

  describe('getRelativeMonths', () => {
    it('calcula corretamente M-1, M e M+1 para datas no meio do ano', () => {
      const refDate = new Date(2026, 9, 20) // Outubro (mês 9 no JS, 10 no calendário)
      const { prevMonthStr, currMonthStr, nextMonthStr } = getRelativeMonths(refDate)

      expect(prevMonthStr).toBe('2026-09')
      expect(currMonthStr).toBe('2026-10')
      expect(nextMonthStr).toBe('2026-11')
    })

    it('calcula corretamente M-1 na virada de ano (Janeiro -> Dezembro do ano anterior)', () => {
      const refDate = new Date(2027, 0, 15) // Janeiro 2027
      const { prevMonthStr, currMonthStr, nextMonthStr } = getRelativeMonths(refDate)

      expect(prevMonthStr).toBe('2026-12')
      expect(currMonthStr).toBe('2027-01')
      expect(nextMonthStr).toBe('2027-02')
    })

    it('calcula corretamente M+1 na virada de ano (Dezembro -> Janeiro do ano seguinte)', () => {
      const refDate = new Date(2026, 11, 25) // Dezembro 2026
      const { prevMonthStr, currMonthStr, nextMonthStr } = getRelativeMonths(refDate)

      expect(prevMonthStr).toBe('2026-11')
      expect(currMonthStr).toBe('2026-12')
      expect(nextMonthStr).toBe('2027-01')
    })

    it('não pula Fevereiro quando a data de referência é dia 31 (ex: 31 de Janeiro ou 31 de Março)', () => {
      const jan31 = new Date(2026, 0, 31) // 31 de Janeiro de 2026
      expect(getRelativeMonths(jan31)).toEqual({
        prevMonthStr: '2025-12',
        currMonthStr: '2026-01',
        nextMonthStr: '2026-02',
      })

      const mar31 = new Date(2026, 2, 31) // 31 de Março de 2026
      expect(getRelativeMonths(mar31)).toEqual({
        prevMonthStr: '2026-02',
        currMonthStr: '2026-03',
        nextMonthStr: '2026-04',
      })
    })
  })

  describe('getDaysInMonth', () => {
    it('retorna 31 dias para meses longos (ex: Janeiro, Março, Outubro)', () => {
      expect(getDaysInMonth('2026-01')).toBe(31)
      expect(getDaysInMonth('2026-03')).toBe(31)
      expect(getDaysInMonth('2026-10')).toBe(31)
    })

    it('retorna 30 dias para meses de 30 dias (ex: Abril, Junho, Setembro, Novembro)', () => {
      expect(getDaysInMonth('2026-04')).toBe(30)
      expect(getDaysInMonth('2026-06')).toBe(30)
      expect(getDaysInMonth('2026-09')).toBe(30)
      expect(getDaysInMonth('2026-11')).toBe(30)
    })

    it('retorna 28 dias para Fevereiro em anos não bissextos e 29 em anos bissextos', () => {
      expect(getDaysInMonth('2025-02')).toBe(28)
      expect(getDaysInMonth('2026-02')).toBe(28)
      expect(getDaysInMonth('2027-02')).toBe(28)
      expect(getDaysInMonth('2024-02')).toBe(29)
      expect(getDaysInMonth('2028-02')).toBe(29)
    })
  })

  describe('transformSeedData', () => {
    const rawDemo = demoJson as unknown as AppDataSnapshot

    it('converte corretamente as chaves estáticas de 2026-09, 2026-10 e 2026-11 para datas relativas do sistema', () => {
      // Definindo uma data de referência em Março de 2027 (M-1 = 2027-02, M = 2027-03, M+1 = 2027-04)
      const refDate = new Date(2027, 2, 10)
      const transformed = transformSeedData(rawDemo, refDate)

      // monthParticipants
      expect(transformed.monthParticipants).toHaveProperty('2027-02')
      expect(transformed.monthParticipants).toHaveProperty('2027-03')
      expect(transformed.monthParticipants).toHaveProperty('2027-04')
      expect(transformed.monthParticipants).not.toHaveProperty('2026-10')
      expect(transformed.monthParticipants['2027-03']).toHaveLength(7)

      // monthActiveShifts e monthActiveRules
      expect(transformed.monthActiveShifts).toHaveProperty('2027-03')
      expect(transformed.monthActiveRules).toHaveProperty('2027-03')

      // assignments: chaves de data devem pertencer aos meses 2027-02, 2027-03 ou 2027-04
      const assignmentKeys = Object.keys(transformed.assignments || {})
      expect(assignmentKeys.length).toBeGreaterThan(0)
      expect(assignmentKeys.some((k) => k.startsWith('2027-02'))).toBe(true)
      expect(assignmentKeys.some((k) => k.startsWith('2027-03'))).toBe(true)
      expect(assignmentKeys.some((k) => k.startsWith('2027-04'))).toBe(true)
      expect(assignmentKeys.some((k) => k.startsWith('2026-10'))).toBe(false)

      // dayShiftAssignments
      const dayShiftKeys = Object.keys(transformed.dayShiftAssignments || {})
      expect(dayShiftKeys.length).toBeGreaterThan(0)
      expect(dayShiftKeys.some((k) => k.startsWith('2027-03'))).toBe(true)

      // availabilities
      const monthsInAvailabilities = (
        transformed.availabilities as MonthlyAvailability[]
      ).map((a) => a.month)
      expect(monthsInAvailabilities).toContain('2027-03')
      expect(monthsInAvailabilities).toContain('2027-04')
      expect(monthsInAvailabilities).not.toContain('2026-10')
    })

    it('mapeia os eventos em events e preserva os 4 endereços em addresses com seus addressId correspondentes', () => {
      const refDate = new Date(2027, 4, 15) // Maio 2027 (M-1 = Abril, M = Maio, M+1 = Junho)
      const transformed = transformSeedData(rawDemo, refDate)

      // Endereços intactos
      expect(transformed.addresses).toHaveLength(4)
      const addressIds = transformed.addresses?.map((a) => a.id)
      expect(addressIds).toEqual([
        'addr_seed_01',
        'addr_seed_02',
        'addr_seed_03',
        'addr_seed_04',
      ])

      // Eventos mapeados
      expect(transformed.events).toHaveLength(rawDemo.events.length)
      transformed.events.forEach((ev: CalendarEvent) => {
        expect(addressIds).toContain(ev.addressId)
        expect(ev.personId).toMatch(/^p_seed_/)
        expect(ev.title).toBeTruthy()
        expect(ev.time).toMatch(/^\d{2}:\d{2}$/)
        // Data deve começar com 2027-04, 2027-05 ou 2027-06
        const monthPrefix = ev.date.slice(0, 7)
        expect(['2027-04', '2027-05', '2027-06']).toContain(monthPrefix)
      })
    })

    it('não quebra em meses com menos dias (ex: Fevereiro com 28 dias) e ajusta dias limites', () => {
      // Usando Fevereiro de 2026 como mês atual (M-1 = Janeiro [31], M = Fevereiro [28], M+1 = Março [31])
      const refDate = new Date(2026, 1, 10)
      const transformed = transformSeedData(rawDemo, refDate)

      // Mês atual é 2026-02 (28 dias)
      expect(getDaysInMonth('2026-02')).toBe(28)

      // Assignments em Fevereiro não devem ultrapassar dia 28
      Object.keys(transformed.assignments || {}).forEach((dateStr) => {
        if (dateStr.startsWith('2026-02')) {
          const day = parseInt(dateStr.slice(8, 10), 10)
          expect(day).toBeLessThanOrEqual(28)
          expect(day).toBeGreaterThanOrEqual(1)
        }
      })

      // dayShiftAssignments em Fevereiro não devem ultrapassar dia 28
      Object.keys(transformed.dayShiftAssignments || {}).forEach((dateStr) => {
        if (dateStr.startsWith('2026-02')) {
          const day = parseInt(dateStr.slice(8, 10), 10)
          expect(day).toBeLessThanOrEqual(28)
        }
      })

      // monthDailyShifts em Fevereiro (2026-02) não deve conter nenhum dia > 28
      const febDailyShifts = transformed.monthDailyShifts?.['2026-02']
      if (febDailyShifts) {
        Object.values(febDailyShifts).forEach((days) => {
          days.forEach((dayNum) => {
            expect(dayNum).toBeLessThanOrEqual(28)
          })
        })
      }

      // availabilities em Fevereiro não deve conter dia 29, 30 ou 31
      const febAvailabilities = (
        transformed.availabilities as MonthlyAvailability[]
      ).filter((a) => a.month === '2026-02')
      febAvailabilities.forEach((avail) => {
        avail.availableDays.forEach((d: number) => {
          expect(d).toBeLessThanOrEqual(28)
        })
        if (avail.shiftAvailability) {
          Object.values(avail.shiftAvailability).forEach((days: number[]) => {
            days.forEach((d: number) => {
              expect(d).toBeLessThanOrEqual(28)
            })
          })
        }
        if (avail.shiftRates) {
          Object.values(avail.shiftRates).forEach((rates: Record<string, number>) => {
            Object.keys(rates).forEach((dStr) => {
              expect(Number(dStr)).toBeLessThanOrEqual(28)
            })
          })
        }
      })

      // Eventos em Fevereiro não devem ultrapassar dia 28
      transformed.events.forEach((ev: CalendarEvent) => {
        if (ev.date.startsWith('2026-02')) {
          const day = parseInt(ev.date.slice(8, 10), 10)
          expect(day).toBeLessThanOrEqual(28)
        }
      })
    })

    it('ajusta dias para meses de 30 dias (ex: Abril com 30 dias)', () => {
      // Abril como mês atual (M-1 = Março [31], M = Abril [30], M+1 = Maio [31])
      const refDate = new Date(2026, 3, 10)
      const transformed = transformSeedData(rawDemo, refDate)

      expect(getDaysInMonth('2026-04')).toBe(30)

      Object.keys(transformed.assignments || {}).forEach((dateStr) => {
        if (dateStr.startsWith('2026-04')) {
          const day = parseInt(dateStr.slice(8, 10), 10)
          expect(day).toBeLessThanOrEqual(30)
        }
      })

      const aprDailyShifts = transformed.monthDailyShifts?.['2026-04']
      if (aprDailyShifts) {
        Object.values(aprDailyShifts).forEach((days) => {
          days.forEach((dayNum) => {
            expect(dayNum).toBeLessThanOrEqual(30)
          })
        })
      }
    })

    it('valida os 3 meses envolvidos (anterior, atual e seguinte) com Fevereiro em qualquer posição (28 e 29 dias) tanto em Português quanto em Inglês', () => {
      const datasets = [
        { lang: 'pt-BR', data: demoJson as unknown as AppDataSnapshot },
        { lang: 'en-US', data: demoEnJson as unknown as AppDataSnapshot },
      ]

      // Cenários onde Fevereiro é M+1 (ref: Jan), M (ref: Fev), M-1 (ref: Mar) e ano bissexto (2028)
      const scenarios = [
        { refDate: new Date(2026, 0, 31), expectedMonths: ['2025-12', '2026-01', '2026-02'] },
        { refDate: new Date(2026, 1, 15), expectedMonths: ['2026-01', '2026-02', '2026-03'] },
        { refDate: new Date(2026, 2, 31), expectedMonths: ['2026-02', '2026-03', '2026-04'] },
        { refDate: new Date(2028, 1, 15), expectedMonths: ['2028-01', '2028-02', '2028-03'] },
      ]

      for (const { data } of datasets) {
        for (const { refDate, expectedMonths } of scenarios) {
          const transformed = transformSeedData(data, refDate)

          // Garante que os 3 meses envolvidos foram mapeados em todas as estruturas mensais
          expect(Object.keys(transformed.monthParticipants).sort()).toEqual(expectedMonths)
          expect(Object.keys(transformed.monthActiveShifts || {}).sort()).toEqual(expectedMonths)
          expect(Object.keys(transformed.monthActiveRules || {}).sort()).toEqual(expectedMonths)
          expect(Object.keys(transformed.monthDailyShifts || {}).sort()).toEqual(expectedMonths)

          for (const monthStr of expectedMonths) {
            const maxDays = getDaysInMonth(monthStr)

            // 1. monthDailyShifts
            const dailyShifts = transformed.monthDailyShifts?.[monthStr] || {}
            Object.values(dailyShifts).forEach((days) => {
              days.forEach((d) => {
                expect(d).toBeGreaterThanOrEqual(1)
                expect(d).toBeLessThanOrEqual(maxDays)
              })
            })

            // 2. assignments
            Object.keys(transformed.assignments || {})
              .filter((k) => k.startsWith(monthStr))
              .forEach((dateStr) => {
                const day = parseInt(dateStr.slice(8, 10), 10)
                expect(day).toBeGreaterThanOrEqual(1)
                expect(day).toBeLessThanOrEqual(maxDays)
              })

            // 3. dayShiftAssignments
            Object.keys(transformed.dayShiftAssignments || {})
              .filter((k) => k.startsWith(monthStr))
              .forEach((dateStr) => {
                const day = parseInt(dateStr.slice(8, 10), 10)
                expect(day).toBeGreaterThanOrEqual(1)
                expect(day).toBeLessThanOrEqual(maxDays)
              })

            // 4. availabilities
            const monthAvails = (transformed.availabilities as MonthlyAvailability[]).filter(
              (a) => a.month === monthStr
            )
            expect(monthAvails.length).toBeGreaterThan(0)
            monthAvails.forEach((avail) => {
              avail.availableDays.forEach((d) => {
                expect(d).toBeGreaterThanOrEqual(1)
                expect(d).toBeLessThanOrEqual(maxDays)
              })
              Object.values(avail.shiftAvailability || {}).forEach((days) => {
                days.forEach((d) => {
                  expect(d).toBeGreaterThanOrEqual(1)
                  expect(d).toBeLessThanOrEqual(maxDays)
                })
              })
              Object.values(avail.shiftRates || {}).forEach((rates) => {
                Object.keys(rates).forEach((dStr) => {
                  const d = Number(dStr)
                  expect(d).toBeGreaterThanOrEqual(1)
                  expect(d).toBeLessThanOrEqual(maxDays)
                })
              })
            })

            // 5. events
            transformed.events
              .filter((ev) => ev.date.startsWith(monthStr))
              .forEach((ev) => {
                const day = parseInt(ev.date.slice(8, 10), 10)
                expect(day).toBeGreaterThanOrEqual(1)
                expect(day).toBeLessThanOrEqual(maxDays)
              })
          }

          // Quando Fevereiro de 28 dias é o mês anterior (ex: ref Março 2026),
          // o dia 28 de Fevereiro deve preservar sua escala original sem ser sobrescrito pelos dias 29/30
          if (expectedMonths[0] === '2026-02') {
            expect(transformed.assignments['2026-02-28']).toEqual(['p_seed_07'])
            expect(transformed.assignments['2026-02-29']).toBeUndefined()
            expect(transformed.assignments['2026-02-30']).toBeUndefined()
          }
        }
      }
    })
  })

  describe('isGuestDataEmpty', () => {
    it('retorna true quando o armazenamento local não contém pessoas nem escalas', () => {
      expect(isGuestDataEmpty()).toBe(true)
    })

    it('retorna false quando há pessoas salvas', () => {
      StorageService.savePersons([
        { id: 'p1', name: 'Dr. Teste', color: '#000000', active: true },
      ])
      expect(isGuestDataEmpty()).toBe(false)
    })

    it('retorna false quando há escalas salvas', () => {
      StorageService.saveAssignments({ '2026-10-01': ['p1'] })
      expect(isGuestDataEmpty()).toBe(false)
    })
  })

  describe('loadGuestSeedData', () => {
    it('carrega o JSON demo, transforma dinamicamente e popula o armazenamento local e store', async () => {
      // Mock de fetch para retornar o demoJson
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => demoJson,
      } as Response)

      const refDate = new Date(2026, 9, 15) // 2026-10
      expect(isGuestDataEmpty()).toBe(true)

      const snapshot = await loadGuestSeedData({ refDate })

      expect(fetchSpy).toHaveBeenCalled()
      expect(snapshot).not.toBeNull()
      expect(snapshot.people).toHaveLength(7)

      // Verifica que o armazenamento local foi populado
      expect(isGuestDataEmpty()).toBe(false)
      expect(StorageService.getPersons()).toHaveLength(7)
      expect(StorageService.getAddresses()).toHaveLength(4)
      expect(Object.keys(StorageService.getAssignments()).length).toBeGreaterThan(0)

      // Verifica que o Zustand store foi atualizado com o mês atual dinâmico
      const state = useScheduleStore.getState()
      expect(state.currentMonth).toBe('2026-10')
      expect(state.persons).toHaveLength(7)
      expect(state.addresses).toHaveLength(4)
      expect(state.currentView).toBe('calendar')

      // Verifica que o onboarding foi marcado como checado
      expect(StorageService.hasCheckedOnboarding()).toBe(true)
    })

    it('salva o snapshot no perfil de convidado ativo se houver um ativo', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => demoJson,
      } as Response)

      StorageService.setActiveGuestId('guest_test_123')
      StorageService.saveGuestProfiles([
        {
          id: 'guest_test_123',
          name: 'Convidado Teste',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        },
      ])

      await loadGuestSeedData()

      const guestDataset = StorageService.getGuestDataset('guest_test_123')
      expect(guestDataset).not.toBeNull()
      expect(guestDataset?.persons).toHaveLength(7)
      expect(guestDataset?.addresses).toHaveLength(4)
    })

    it('dispara erro explicativo caso fetch retorne status não-ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      await expect(loadGuestSeedData()).rejects.toThrow(/Failed to load seed JSON/i)
    })

    it('carrega dados em inglês dos EUA (demo-en.json) quando o idioma da aplicação está em inglês', async () => {
      await i18n.changeLanguage('en-US')

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => demoEnJson,
      } as Response)

      const refDate = new Date(2026, 9, 15) // 2026-10
      const snapshot = await loadGuestSeedData({ refDate })

      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('demo/demo-en.json'))
      expect(snapshot.people).toHaveLength(7)
      expect(snapshot.people[0].name).toBe('Dr. Emily Carter')

      // Verifica plantões em inglês
      const shifts = StorageService.getShiftDefinitions()
      expect(shifts.map((s) => s.name)).toEqual([
        '12h Day Shift',
        '12h Night Shift',
        '24h On-Call Shift',
      ])

      // Verifica regras em inglês
      const rules = StorageService.getShiftRules()
      expect(rules.map((r) => r.name)).toEqual([
        'Max 1 shift per day',
        'Max 2 shifts per week',
        'Minimum rest between shifts',
      ])

      // Verifica endereços dos EUA em inglês
      const addresses = StorageService.getAddresses()
      expect(addresses).toHaveLength(4)
      expect(addresses[0].name).toBe('Massachusetts General Hospital')
      expect(addresses[0].city).toBe('Boston, MA')
      expect(addresses[0].street).toBe('Fruit Street')

      // Verifica eventos em inglês
      const events = StorageService.getEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].title).toBe('Emergency Protocols Training')

      // Verifica que o store global reflete os dados em inglês
      const state = useScheduleStore.getState()
      expect(state.persons[0].name).toBe('Dr. Emily Carter')
      expect(state.shiftDefinitions[0].name).toBe('12h Day Shift')
      expect(state.shiftRules[0].name).toBe('Max 1 shift per day')
      expect(state.addresses[0].name).toBe('Massachusetts General Hospital')
    })
  })

  describe('resolveSeedUrl & isEnglishLanguage', () => {
    it('identifica corretamente idiomas em inglês e português', async () => {
      expect(isEnglishLanguage('en')).toBe(true)
      expect(isEnglishLanguage('en-US')).toBe(true)
      expect(isEnglishLanguage('pt-BR')).toBe(false)
      expect(isEnglishLanguage('pt')).toBe(false)

      await i18n.changeLanguage('en-US')
      expect(isEnglishLanguage()).toBe(true)

      await i18n.changeLanguage('pt-BR')
      expect(isEnglishLanguage()).toBe(false)
    })

    it('respeita customUrl quando fornecida', () => {
      expect(resolveSeedUrl('/custom/path.json')).toBe('/custom/path.json')
    })

    it('monta a URL contendo demo/demo.json quando em português', async () => {
      await i18n.changeLanguage('pt-BR')
      const url = resolveSeedUrl()
      expect(url).toContain('demo/demo.json')
    })

    it('monta a URL contendo demo/demo-en.json quando em inglês', async () => {
      await i18n.changeLanguage('en-US')
      const url = resolveSeedUrl()
      expect(url).toContain('demo/demo-en.json')
    })
  })
})

