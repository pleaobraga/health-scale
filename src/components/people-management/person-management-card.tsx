import { Edit2, Trash2, CalendarCheck2, RotateCcw, UserX, CheckCircle, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Person } from '../../types'

export interface PersonManagementCardProps {
  person: Person
  monthsCount: number
  isInCurrentMonth: boolean
  canDelete: boolean
  onEdit: (person: Person) => void
  onDeactivate: (person: Person) => void
  onDeleteRequest: (person: Person) => void
  onReactivate: (personId: string) => void
}

export function PersonManagementCard({
  person,
  monthsCount,
  isInCurrentMonth,
  canDelete,
  onEdit,
  onDeactivate,
  onDeleteRequest,
  onReactivate,
}: PersonManagementCardProps) {
  const { t } = useTranslation(['people', 'common'])
  const isActive = person.active !== false

  return (
    <div
      data-testid={`person-card-${person.id}`}
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 flex flex-col justify-between gap-4 shadow-xs transition group ${
        !isActive
          ? 'opacity-65 hover:opacity-100 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          : 'border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top: Avatar & Info */}
      <div className="flex items-start gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 transition-opacity ${
            !isActive ? 'grayscale-[40%]' : ''
          }`}
          style={{ backgroundColor: person.color }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 justify-between">
            <h3
              className={`text-sm font-bold truncate ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 line-through decoration-slate-400/60'
              }`}
              title={person.name}
            >
              {person.name}
            </h3>

            {/* Active / Inactive Badge */}
            {!isActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                <UserX className="w-2.5 h-2.5" />
                <span>{t('people:inactive')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                <CheckCircle className="w-2.5 h-2.5" />
                <span>{t('people:active')}</span>
              </span>
            )}
          </div>

          {/* Color swatch & Hex code */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: person.color }}
              title={person.color}
            />
            <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {person.color.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Stats */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <CalendarCheck2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>
            {monthsCount === 1
              ? t('people:management.monthsLinked', { count: monthsCount })
              : t('people:management.monthsLinkedPlural', { count: monthsCount })}
          </span>
        </span>

        {isInCurrentMonth && (
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/60">
            {t('people:management.inCurrentMonth')}
          </span>
        )}
      </div>

      {/* Action Buttons based on Status */}
      <div className="flex items-center gap-2 pt-1">
        {isActive ? (
          <>
            <button
              type="button"
              onClick={() => onEdit(person)}
              title={t('people:management.editTitle', { name: person.name })}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('people:management.edit')}</span>
            </button>

            <button
              type="button"
              onClick={() => onDeactivate(person)}
              title={t('people:management.deactivateTitle', { name: person.name })}
              aria-label={t('people:management.deactivateTitle', { name: person.name })}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{t('people:management.deactivate')}</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteRequest(person)}
              title={
                canDelete
                  ? t('people:management.deleteTitle', { name: person.name })
                  : t('people:management.cannotDeleteTitle', { name: person.name })
              }
              aria-label={t('people:management.deleteTitle', { name: person.name })}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onReactivate(person.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('people:management.reactivate')}</span>
            </button>

            <button
              type="button"
              disabled={!canDelete}
              onClick={() => {
                if (canDelete) {
                  onDeleteRequest(person)
                }
              }}
              title={
                canDelete
                  ? t('people:management.deletePermanentTitle', { name: person.name })
                  : t('people:management.cannotDeletePermanentTitle')
              }
              aria-label={t('people:management.deletePermanentTitle', { name: person.name })}
              className={`p-2 rounded-xl border transition ${
                canDelete
                  ? 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-transparent hover:border-rose-200 dark:border-rose-800 cursor-pointer'
                  : 'text-slate-300 dark:text-slate-700 border-transparent cursor-not-allowed opacity-50'
              }`}
            >
              {canDelete ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
