import { useMemo, useState } from 'react'
import { Plus, Landmark, ArrowDownLeft, ArrowUpRight, Percent, Eraser, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CURRENCIES, fmt, fromUSD, toUSD } from './lib'
import { Field, ICONS, Sheet, TxForm, TxRow } from './components'

function useTotals(store) {
  const { txs, accounts, rates, profile } = store
  return useMemo(() => {
    let income = 0, expense = 0
    const cats = {}
    for (const x of txs) {
      const v = toUSD(x.amount, x.currency, rates)
      if (x.type === 'income') income += v
      else { expense += v; cats[x.category] = (cats[x.category] || 0) + v }
    }
    const initial = accounts.reduce((s, a) => s + toUSD(Number(a.initial) || 0, a.currency, rates), 0)
    return { income, expense, cats, balance: initial + income - expense }
  }, [txs, accounts, rates, profile.currency])
}

const show = (usd, store) => fmt(fromUSD(usd, store.profile.currency, store.rates), store.profile.currency)

export function Home({ store, openForm, goProfile }) {
  const { t, txs, profile, clearAll } = store
  const tot = useTotals(store)
  const maxCat = Math.max(1, ...Object.values(tot.cats))
  const actions = [
    { label: t('income'), icon: ArrowDownLeft, run: () => openForm('income') },
    { label: t('expense'), icon: ArrowUpRight, run: () => openForm('expense') },
    { label: t('rates'), icon: Percent, run: goProfile },
    { label: t('clear'), icon: Eraser, run: () => window.confirm(t('confirm')) && clearAll() },
  ]
  return (
    <div className="space-y-5">
      <p className="text-slate-400 text-sm">{t('hello')}, <span className="text-white font-semibold">{profile.name}</span></p>
      <div className="rounded-3xl p-6 bg-gradient-to-br from-brand-dark via-brand to-brand-light shadow-lg shadow-brand/20">
        <p className="text-brand-pale text-sm flex items-center gap-2"><Wallet size={16} />{t('totalBalance')}</p>
        <p className="text-4xl font-bold mt-2">{show(tot.balance, store)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-xs text-slate-400">{t('incomes')}</p><p className="text-lg font-bold text-emerald-400">{show(tot.income, store)}</p></div>
        <div className="card"><p className="text-xs text-slate-400">{t('expenses')}</p><p className="text-lg font-bold text-rose-400">{show(tot.expense, store)}</p></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {actions.map(({ label, icon: Icon, run }) => (
          <button key={label} onClick={run} className="flex flex-col items-center gap-1.5 text-xs text-slate-300">
            <span className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 grid place-items-center text-brand-pale hover:border-brand"><Icon size={20} /></span>
            {label}
          </button>
        ))}
      </div>
      <section className="card">
        <h3 className="font-semibold mb-1">{t('recent')}</h3>
        {txs.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">{t('empty')}</p>
          : <div className="divide-y divide-slate-800">{txs.slice(0, 5).map((x) => <TxRow key={x.id} tx={x} />)}</div>}
      </section>
      <section className="card space-y-3">
        <h3 className="font-semibold">{t('byCategory')}</h3>
        {Object.keys(tot.cats).length === 0 && <p className="text-sm text-slate-500 text-center py-2">{t('empty')}</p>}
        {Object.entries(tot.cats).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
          <div key={c}>
            <div className="flex justify-between text-sm mb-1"><span>{c}</span><span className="text-slate-400">{show(v, store)}</span></div>
            <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-brand to-brand-pale" style={{ width: `${(v / maxCat) * 100}%` }} /></div>
          </div>
        ))}
      </section>
    </div>
  )
}

const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }

export function Stats({ store }) {
  const { t, txs, rates } = store
  const tot = useTotals(store)
  const monthly = useMemo(() => {
    const m = {}
    for (const x of txs) {
      const k = x.date.slice(0, 7)
      m[k] ??= { month: k, income: 0, expense: 0 }
      m[k][x.type] += toUSD(x.amount, x.currency, rates)
    }
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
      .map((r) => ({ ...r, income: +r.income.toFixed(2), expense: +r.expense.toFixed(2) }))
  }, [txs, rates])
  const catData = Object.entries(tot.cats).map(([name, v]) => ({ name, value: +v.toFixed(2) })).sort((a, b) => b.value - a.value)
  const axis = { stroke: '#64748b', fontSize: 11 }
  return (
    <div className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
      <section className="card">
        <h3 className="font-semibold mb-3">{t('monthly')} (USD)</h3>
        {monthly.length === 0 ? <p className="text-sm text-slate-500 text-center py-10">{t('empty')}</p> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" {...axis} /><YAxis {...axis} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b55' }} />
              <Bar dataKey="income" name={t('incomes')} fill="#0057FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name={t('expenses')} fill="#7AABFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
      <section className="card">
        <h3 className="font-semibold mb-3">{t('cats')} (USD)</h3>
        {catData.length === 0 ? <p className="text-sm text-slate-500 text-center py-10">{t('empty')}</p> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid stroke="#1e293b" horizontal={false} />
              <XAxis type="number" {...axis} /><YAxis type="category" dataKey="name" {...axis} width={80} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b55' }} />
              <Bar dataKey="value" name="USD" radius={[0, 6, 6, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={['#0057FF', '#3D7FFF', '#7AABFF', '#003DB3'][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  )
}

function AccountForm({ store, onDone }) {
  const [f, setF] = useState({ name: '', currency: 'USD', initial: '' })
  const { t, addAccount } = store
  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    addAccount({ name: f.name.trim(), currency: f.currency, initial: parseFloat(f.initial) || 0, icon: 'bank' })
    onDone()
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label={t('name')}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('currency')}>
          <select value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label={t('initial')}><input type="number" step="0.01" value={f.initial} onChange={(e) => setF({ ...f, initial: e.target.value })} /></Field>
      </div>
      <button className="btn w-full">{t('save')}</button>
    </form>
  )
}

export function WalletScreen({ store }) {
  const { t, accounts, txs, rates, removeTx } = store
  const [tab, setTab] = useState('accounts')
  const [adding, setAdding] = useState(false)
  const balance = (a) => Number(a.initial || 0) + txs.filter((x) => x.accountId === a.id)
    .reduce((s, x) => s + (x.type === 'income' ? 1 : -1) * fromUSD(toUSD(x.amount, x.currency, rates), a.currency, rates), 0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 bg-slate-900 rounded-xl p-1">
        {['accounts', 'movements'].map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`py-2 rounded-lg text-sm font-semibold ${tab === k ? 'bg-brand text-white' : 'text-slate-400'}`}>{t(k)}</button>
        ))}
      </div>
      {tab === 'accounts' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {accounts.map((a) => {
              const Icon = ICONS[a.icon] || Landmark
              return (
                <div key={a.id} className="card bg-gradient-to-br from-slate-900 to-slate-800">
                  <Icon className="text-brand-pale mb-3" size={22} />
                  <p className="text-sm text-slate-400">{a.name}</p>
                  <p className="font-bold">{fmt(balance(a), a.currency)}</p>
                </div>
              )
            })}
          </div>
          <button onClick={() => setAdding(true)} className="btn w-full flex items-center justify-center gap-2"><Plus size={16} />{t('addAccount')}</button>
          {adding && <Sheet title={t('addAccount')} onClose={() => setAdding(false)}><AccountForm store={store} onDone={() => setAdding(false)} /></Sheet>}
        </>
      ) : (
        <>
          <section className="card"><TxForm store={store} /></section>
          <section className="card">
            {txs.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">{t('empty')}</p>
              : <div className="divide-y divide-slate-800">{txs.map((x) => <TxRow key={x.id} tx={x} onDelete={removeTx} />)}</div>}
          </section>
        </>
      )}
    </div>
  )
}

export function Profile({ store }) {
  const { t, profile, setProfile, rates, setRates, clearAll } = store
  return (
    <div className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 md:items-start">
      <section className="card space-y-3">
        <Field label={t('name')}><input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} /></Field>
        <Field label={t('language')}>
          <select value={profile.lang} onChange={(e) => setProfile({ lang: e.target.value })}>
            <option value="es">Español</option><option value="en">English</option>
          </select>
        </Field>
        <Field label={t('mainCurrency')}>
          <select value={profile.currency} onChange={(e) => setProfile({ currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
      </section>
      <section className="card space-y-3">
        <h3 className="font-semibold">{t('ratesTitle')}</h3>
        {['USD', 'EUR', 'USDT'].map((c) => (
          <Field key={c} label={`1 ${c} = Bs`}>
            <input type="number" step="0.01" min="0" value={rates[c]} onChange={(e) => setRates({ [c]: parseFloat(e.target.value) || 0 })} />
          </Field>
        ))}
      </section>
      <section className="card border-rose-900/60 space-y-3 md:col-span-2">
        <h3 className="font-semibold text-rose-400">{t('danger')}</h3>
        <p className="text-sm text-slate-400">{t('dangerDesc')}</p>
        <button onClick={() => window.confirm(t('confirm')) && clearAll()} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500">{t('clearAll')}</button>
      </section>
    </div>
  )
}
