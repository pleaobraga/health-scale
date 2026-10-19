import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Search,
  User as UserIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CreateUserModal } from '../components/users/create-user-modal'
import { db } from '../services/firebase'

import type { UserRole } from '../context/auth-context'

export interface AppUserRecord {
  uid: string
  name: string
  email: string
  role: UserRole
  createdAt?: unknown
}

export function UserManagementView() {
  const { t } = useTranslation(['users', 'common'])
  const [users, setUsers] = useState<AppUserRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setErrorFeedback(null)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      const loadedUsers: AppUserRecord[] = []
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        loadedUsers.push({
          uid: docSnap.id,
          name: data.name || 'Sem Nome',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt,
        })
      })

      setUsers(loadedUsers)
    } catch (err) {
      console.error('Error fetching users from Firestore:', err)
      setErrorFeedback(
        t('users:errors.fetchFailed'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    )
  })

  return (
    <div
      data-testid="user-management-view"
      className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar"
    >
      <div className="w-full max-w-5xl space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('users:title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('users:subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchUsers}
              title={t('users:reloadList')}
              aria-label={t('users:reloadList')}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('users:newUser')}</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('users:searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('users:total')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {users.length === 1
                ? t('users:userCount', { count: users.length })
                : t('users:userCountPlural', { count: users.length })}
            </span>
          </div>
        </div>

        {/* Error notification */}
        {errorFeedback && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
            {errorFeedback}
          </div>
        )}

        {/* User Cards / List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('users:loading')}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <UserIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('users:emptySearchTitle')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('users:emptySearchSubtitle')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((appUser) => {
              const isAdmin = appUser.role === 'admin'

              return (
                <div
                  key={appUser.uid}
                  data-testid={`user-card-${appUser.uid}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isAdmin
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80'
                      }`}
                    >
                      {isAdmin ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {appUser.name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {appUser.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 ${
                      isAdmin
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isAdmin ? t('users:roles.admin') : t('users:roles.user')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserCreated={fetchUsers}
        />
      </div>
    </div>
  )
}
