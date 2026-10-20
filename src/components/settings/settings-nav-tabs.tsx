import { Settings, Clock, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

export function SettingsNavTabs() {
  const { t } = useTranslation(['settings'])

  const tabs = [
    {
      to: '/configuracoes',
      label: t('settings:nav.general'),
      icon: Settings,
      end: true,
    },
    {
      to: '/configuracoes/turnos',
      label: t('settings:nav.shifts'),
      icon: Clock,
      end: false,
    },
    {
      to: '/configuracoes/regras',
      label: t('settings:nav.rules'),
      icon: ShieldCheck,
      end: false,
    },
  ]

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 w-full sm:w-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

