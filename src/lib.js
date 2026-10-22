import { useEffect, useState } from 'react'

export const CURRENCIES = ['USD', 'EUR', 'Bs', 'USDT']
export const SYMBOLS = { USD: '$', EUR: '€', Bs: 'Bs', USDT: '₮' }

export const CATEGORIES = {
  income: ['Salario', 'Freelance', 'Inversiones', 'Otros ingresos'],
  expense: ['Comida', 'Transporte', 'Hogar', 'Ocio', 'Salud', 'Servicios', 'Otros'],
}

const T = {
  es: {
    home: 'Inicio', stats: 'Estadísticas', wallet: 'Billetera', profile: 'Perfil',
    totalBalance: 'Saldo total', income: 'Ingreso', expense: 'Gasto', incomes: 'Ingresos', expenses: 'Gastos',
    rates: 'Tasas', clear: 'Limpiar', recent: 'Últimos movimientos', byCategory: 'Gastos por categoría',
    empty: 'Sin movimientos aún', accounts: 'Cuentas', movements: 'Movimientos', addAccount: 'Agregar cuenta',
    date: 'Fecha', description: 'Descripción', category: 'Categoría', amount: 'Monto', currency: 'Moneda',
    account: 'Cuenta', save: 'Guardar', name: 'Nombre', initial: 'Saldo inicial', language: 'Idioma',
    mainCurrency: 'Moneda principal', ratesTitle: 'Tasas de cambio (en Bs)', danger: 'Zona de riesgo',
    dangerDesc: 'Borra todos los datos guardados en este dispositivo.', clearAll: 'Borrar todos los datos',
    confirm: '¿Seguro? Esta acción no se puede deshacer.', monthly: 'Flujo mensual', cats: 'Desglose por categoría',
    hello: 'Hola', delete: 'Eliminar', cancel: 'Cancelar', quick: 'Acción rápida', none: 'Ninguna',
  },
  en: {
    home: 'Home', stats: 'Stats', wallet: 'Wallet', profile: 'Profile',
    totalBalance: 'Total balance', income: 'Income', expense: 'Expense', incomes: 'Income', expenses: 'Expenses',
    rates: 'Rates', clear: 'Clear', recent: 'Latest transactions', byCategory: 'Expenses by category',
    empty: 'No transactions yet', accounts: 'Accounts', movements: 'Transactions', addAccount: 'Add account',
    date: 'Date', description: 'Description', category: 'Category', amount: 'Amount', currency: 'Currency',
    account: 'Account', save: 'Save', name: 'Name', initial: 'Initial balance', language: 'Language',
    mainCurrency: 'Main currency', ratesTitle: 'Exchange rates (in Bs)', danger: 'Danger zone',
    dangerDesc: 'Deletes all data stored on this device.', clearAll: 'Delete all data',
    confirm: 'Are you sure? This cannot be undone.', monthly: 'Monthly flow', cats: 'Category breakdown',
    hello: 'Hi', delete: 'Delete', cancel: 'Cancel', quick: 'Quick action', none: 'None',
  },
}

const DEFAULTS = {
  profile: { name: 'Usuario', lang: 'es', currency: 'USD' },
  rates: { USD: 40, EUR: 43, USDT: 40 }, // Bs por unidad
  accounts: [
    { id: 'a1', name: 'Efectivo', icon: 'cash', currency: 'USD', initial: 0 },
    { id: 'a2', name: 'Banco', icon: 'bank', currency: 'Bs', initial: 0 },
    { id: 'a3', name: 'Binance', icon: 'coins', currency: 'USDT', initial: 0 },
    { id: 'a4', name: 'PayPal', icon: 'paypal', currency: 'USD', initial: 0 },
  ],
  txs: [],
}

const KEY = 'tf-finance-v1'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return raw ? { ...DEFAULTS, ...raw } : DEFAULTS
  } catch { return DEFAULTS }
}

export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* sin almacenamiento */ }
  }, [state])
  const t = (k) => T[state.profile.lang]?.[k] ?? k
  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  return {
    ...state, t,
    setProfile: (p) => update({ profile: { ...state.profile, ...p } }),
    setRates: (r) => update({ rates: { ...state.rates, ...r } }),
    addTx: (tx) => update({ txs: [{ ...tx, id: crypto.randomUUID() }, ...state.txs] }),
    removeTx: (id) => update({ txs: state.txs.filter((x) => x.id !== id) }),
    addAccount: (a) => update({ accounts: [...state.accounts, { ...a, id: crypto.randomUUID() }] }),
    clearAll: () => { setState(DEFAULTS) },
  }
}

// Convierte cualquier moneda a USD usando tasas en Bs por unidad.
export function toUSD(amount, cur, rates) {
  const usd = rates.USD || 1
  if (cur === 'USD') return amount
  if (cur === 'Bs') return amount / usd
  return (amount * (rates[cur] || 0)) / usd
}

export function fromUSD(amount, cur, rates) {
  const usd = rates.USD || 1
  if (cur === 'USD') return amount
  if (cur === 'Bs') return amount * usd
  return rates[cur] ? (amount * usd) / rates[cur] : 0
}

export function fmt(n, cur = 'USD') {
  const s = Number(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return cur === 'Bs' ? `Bs ${s}` : `${SYMBOLS[cur] ?? ''}${s}`
}

export const today = () => new Date().toISOString().slice(0, 10)
