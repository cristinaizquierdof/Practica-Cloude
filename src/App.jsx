import { useState } from 'react'
import { BarChart3, Home as HomeIcon, Plus, User, Wallet } from 'lucide-react'
import { useStore } from './lib'
import { Sheet, TxForm } from './components'
import { Home, Profile, Stats, WalletScreen } from './screens'

export default function App() {
  const store = useStore()
  const { t } = store
  const [tab, setTab] = useState('home')
  const [form, setForm] = useState(null) // 'income' | 'expense' | null

  const left = [{ id: 'home', icon: HomeIcon }, { id: 'stats', icon: BarChart3 }]
  const right = [{ id: 'wallet', icon: Wallet }, { id: 'profile', icon: User }]
  const NavBtn = ({ id, icon: Icon }) => (
    <button key={id} onClick={() => setTab(id)} className={`flex-1 flex flex-col items-center gap-1 py-2 text-[11px] ${tab === id ? 'text-brand-pale' : 'text-slate-500'}`}>
      <Icon size={20} />{t(id)}
    </button>
  )

  return (
    <div className="min-h-screen max-w-md md:max-w-3xl mx-auto relative">
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-extrabold tracking-tight"><span className="text-brand-light">TF</span> Finance</h1>
      </header>
      <main className="px-5 pb-32 pt-3">
        {tab === 'home' && <Home store={store} openForm={setForm} goProfile={() => setTab('profile')} />}
        {tab === 'stats' && <Stats store={store} />}
        {tab === 'wallet' && <WalletScreen store={store} />}
        {tab === 'profile' && <Profile store={store} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800">
        <div className="max-w-md md:max-w-3xl mx-auto flex items-center px-2">
          {left.map(NavBtn)}
          <div className="w-16 flex justify-center">
            <button onClick={() => setForm('expense')} aria-label={t('quick')}
              className="-mt-8 w-14 h-14 rounded-full bg-gradient-to-br from-brand-light to-brand-dark grid place-items-center shadow-lg shadow-brand/40 border-4 border-slate-950">
              <Plus size={26} />
            </button>
          </div>
          {right.map(NavBtn)}
        </div>
      </nav>

      {form && (
        <Sheet title={t('quick')} onClose={() => setForm(null)}>
          <TxForm store={store} initialType={form} onDone={() => setForm(null)} />
        </Sheet>
      )}
    </div>
  )
}
