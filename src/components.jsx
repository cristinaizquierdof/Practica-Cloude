import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark, Coins, CreditCard, Trash2 } from 'lucide-react'
import { CATEGORIES, CURRENCIES, fmt, today } from './lib'

export const ICONS = { cash: Banknote, bank: Landmark, coins: Coins, paypal: CreditCard }

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1 block">{label}</span>
      {children}
    </label>
  )
}

export function TxForm({ store, initialType = 'expense', onDone }) {
  const { t, accounts, addTx, profile } = store
  const [type, setType] = useState(initialType)
  const [f, setF] = useState({
    date: today(), description: '', category: CATEGORIES[initialType][0],
    amount: '', currency: profile.currency, accountId: accounts[0]?.id ?? '',
  })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const pickType = (ty) => { setType(ty); set('category', CATEGORIES[ty][0]) }

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(f.amount)
    if (!(amount > 0)) return
    addTx({ ...f, amount, type })
    setF((p) => ({ ...p, description: '', amount: '' }))
    onDone?.()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {['income', 'expense'].map((ty) => (
          <button type="button" key={ty} onClick={() => pickType(ty)}
            className={`py-2.5 rounded-xl text-sm font-semibold border ${type === ty
              ? (ty === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-rose-500/20 border-rose-500 text-rose-300')
              : 'border-slate-800 text-slate-400'}`}>
            {t(ty)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('date')}><input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} required /></Field>
        <Field label={t('account')}>
          <select value={f.accountId} onChange={(e) => set('accountId', e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label={t('description')}><input value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="..." /></Field>
      <Field label={t('category')}>
        <select value={f.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES[type].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('amount')}><input type="number" step="0.01" min="0" value={f.amount} onChange={(e) => set('amount', e.target.value)} required /></Field>
        <Field label={t('currency')}>
          <select value={f.currency} onChange={(e) => set('currency', e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <button className="btn w-full">{t('save')}</button>
    </form>
  )
}

export function TxRow({ tx, onDelete }) {
  const inc = tx.type === 'income'
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${inc ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
        {inc ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{tx.description || tx.category}</p>
        <p className="text-xs text-slate-500">{tx.category} · {tx.date}</p>
      </div>
      <p className={`text-sm font-semibold ${inc ? 'text-emerald-400' : 'text-rose-400'}`}>
        {inc ? '+' : '-'}{fmt(tx.amount, tx.currency)}
      </p>
      {onDelete && (
        <button onClick={() => onDelete(tx.id)} className="text-slate-600 hover:text-rose-400" aria-label="delete"><Trash2 size={16} /></button>
      )}
    </div>
  )
}

export function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-t-3xl md:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}
