import { useState, useEffect, useMemo } from 'react';
import type { ElementType } from 'react';
import {
  Wallet, ArrowUpRight, Plus,
  Landmark, RefreshCw, CloudOff,
  CheckCircle2, AlertCircle, ArrowLeft,
  Home, PieChart, Settings, Coffee, ShoppingBag,
  Tags, Car, Smartphone, Zap, Heart, Gift, Book, Briefcase, Plane, Check,
  Moon, Sun, List, ChevronRight, LayoutGrid, TrendingUp, TrendingDown, Activity,
  Shield, Bell, Utensils, Receipt, Monitor, Dumbbell, Stethoscope, Camera, Trash2, Search
} from 'lucide-react';
import { flushSync } from 'react-dom';

// --- 1. Constants & Mock Data ---

const IconMap = {
  Coffee: <Coffee size={16} />, AlertCircle: <AlertCircle size={16} />, ShoppingBag: <ShoppingBag size={16} />,
  ArrowUpRight: <ArrowUpRight size={16} />, RefreshCw: <RefreshCw size={16} />, Wallet: <Wallet size={16} />,
  Car: <Car size={16} />, Home: <Home size={16} />, Smartphone: <Smartphone size={16} />, Zap: <Zap size={16} />,
  Heart: <Heart size={16} />, Gift: <Gift size={16} />, Book: <Book size={16} />, Briefcase: <Briefcase size={16} />,
  Plane: <Plane size={16} />, Tags: <Tags size={16} />, LayoutGrid: <LayoutGrid size={16} />,
  TrendingUp: <TrendingUp size={16} />, TrendingDown: <TrendingDown size={16} />, Activity: <Activity size={16} />,
  Utensils: <Utensils size={16} />, Receipt: <Receipt size={16} />, Monitor: <Monitor size={16} />,
  Dumbbell: <Dumbbell size={16} />, Stethoscope: <Stethoscope size={16} />
};

const HARDCODED_CATEGORIES = [
  { id: 'e1', name: 'Food & Dining', type: 'expense', icon: 'Utensils' },
  { id: 'e2', name: 'Shopping', type: 'expense', icon: 'ShoppingBag' },
  { id: 'e3', name: 'Transportation', type: 'expense', icon: 'Car' },
  { id: 'e4', name: 'Utilities', type: 'expense', icon: 'Zap' },
  { id: 'e5', name: 'Subscriptions', type: 'expense', icon: 'Monitor' },
  { id: 'e6', name: 'Health', type: 'expense', icon: 'Stethoscope' },
  { id: 'e7', name: 'Travel', type: 'expense', icon: 'Plane' },
  { id: 'e8', name: 'Others', type: 'expense', icon: 'LayoutGrid' },
  { id: 'i1', name: 'Salary', type: 'income', icon: 'Briefcase' },
  { id: 'i2', name: 'Freelance', type: 'income', icon: 'Smartphone' },
  { id: 'i3', name: 'Investment', type: 'income', icon: 'TrendingUp' },
  { id: 'i4', name: 'Gift', type: 'income', icon: 'Gift' },
  { id: 'i5', name: 'Other Income', type: 'income', icon: 'ArrowUpRight' },
];

// Mapping suggestions to specific categories
const CATEGORIZED_SUGGESTIONS = {
  'Food & Dining': ["Lunch", "Dinner", "Snacks", "Grocery", "Coffee", "KFC", "Burger King", "Restaurant Bill"],
  'Shopping': ["Clothes", "Shoes", "Gadgets", "Amazon Purchase", "Gift for friend", "Supermarket"],
  'Transportation': ["Uber", "Bus Fare", "Fuel/Gas", "Parking Fee", "Train Ticket", "Rickshaw"],
  'Utilities': ["Electricity Bill", "Water Bill", "Gas Bill", "Internet Bill", "Trash Collection"],
  'Subscriptions': ["Netflix", "Spotify", "YouTube Premium", "iCloud Storage", "Amazon Prime", "Adobe CC"],
  'Health': ["Pharmacy/Medicine", "Doctor Consultation", "Gym Membership", "Dental Checkup", "Yoga Class"],
  'Travel': ["Flight Ticket", "Hotel Booking", "Visa Fee", "Souvenirs", "Sightseeing"],
  'Salary': ["Monthly Salary", "Performance Bonus", "Overtime Pay"],
  'Freelance': ["Upwork Payout", "Fiverr Project", "Direct Client Work", "Consulting Fee"],
  'Investment': ["Stock Dividends", "Bank Interest", "Crypto Profit", "Gold Investment Return"],
  'Gift': ["Birthday Gift", "Wedding Gift", "Eid Bonus"],
  'Others': ["Miscellaneous", "Laundry", "Home Maintenance", "Charity"]
};

const INITIAL_ACCOUNTS = [
  { id: 1, name: 'Main Bank', balance: 4250.00, type: 'checking', isSynced: true },
  { id: 2, name: 'Cash Wallet', balance: 350.00, type: 'cash', isSynced: true },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, accountId: 1, amount: -45.50, category: 'Food & Dining', title: 'Whole Foods Market', date: '2026-04-09T14:30:00', type: 'expense', isSynced: false, pending: true },
  { id: 2, accountId: 1, amount: -12.99, category: 'Subscriptions', title: 'Netflix', date: '2026-04-08T09:00:00', type: 'expense', isSynced: true },
  { id: 3, accountId: 1, amount: 3200.00, category: 'Salary', title: 'Monthly Salary', date: '2026-04-01T08:00:00', type: 'income', isSynced: true },
  { id: 4, accountId: 1, amount: -120.00, category: 'Utilities', title: 'Electric Bill', date: '2026-03-28T10:15:00', type: 'expense', isSynced: true },
  { id: 5, accountId: 2, amount: 500.00, category: 'Other Income', title: 'ATM Withdrawal', date: '2026-03-25T11:00:00', type: 'income', isSynced: true },
];

const NAV_ITEMS_MAP = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'transactions', icon: List, label: 'History' },
  { id: 'analytics', icon: PieChart, label: 'Analytics' },
  { id: 'profile', icon: Settings, label: 'Settings' }
];

// --- 2. Shared Components & Helpers ---

const FormatCurrency = ({ amount, showSign = false, inheritColor = false, className = "" }) => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const isNegative = safeAmount < 0;
  const formattedValue = Math.abs(safeAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatted = `৳${formattedValue}`;
  const colorClass = inheritColor ? '' : (isNegative ? 'text-rose-600 dark:text-pink-500' : 'text-zinc-900 dark:text-white');
  const signColorClass = inheritColor ? '' : (isNegative ? 'text-rose-600 dark:text-pink-500' : 'text-emerald-600 dark:text-lime-400');

  return (
    <span className={`${className} ${inheritColor ? '' : colorClass}`}>
      {showSign && <span className={inheritColor ? '' : signColorClass}>{isNegative ? '-' : '+'}</span>}
      {formatted}
    </span>
  );
};

const CategoryIcon = ({ category, type, categories }) => {
  const catData = categories.find(c => c.name === category);
  const icon = catData && IconMap[catData.icon] ? IconMap[catData.icon] : <Wallet size={16} />;
  const bgClass = type === 'income'
    ? 'bg-zinc-900 text-emerald-500 dark:bg-black dark:text-lime-400'
    : 'bg-zinc-900 text-rose-500 dark:bg-black dark:text-rose-400';

  return (
    <div className={`p-2.5 rounded-xl ${bgClass} shadow-sm transition-colors duration-300`}>
      {icon}
    </div>
  );
};

const SyncIndicator = ({ hasUnsyncedChanges, syncState, pendingCount, onSync }) => {
  if (!hasUnsyncedChanges && syncState !== 'syncing') return null;
  return (
    <button onClick={onSync} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs tracking-wider font-bold uppercase transition-all duration-300 ${syncState === 'syncing' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400' : syncState === 'synced' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:scale-105'}`}>
      {syncState === 'syncing' ? <><RefreshCw size={12} className="animate-spin" /> Syncing</> : syncState === 'synced' ? <><CheckCircle2 size={12} /> Synced</> : <><CloudOff size={12} /> {pendingCount} Pending</>}
    </button>
  );
};

const Toggle = ({ active, onChange }) => (
  <div onClick={onChange} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-violet-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </div>
);

const SettingsRow = ({ icon: Icon, label, value, onClick, isDanger }: { icon: ElementType, label: string, value?: string, onClick?: () => void, isDanger?: boolean }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors ${isDanger ? 'hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-500' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-white'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
        <Icon size={18} className={isDanger ? 'text-rose-600 dark:text-rose-500' : 'text-zinc-600 dark:text-zinc-400'} />
      </div>
      <span className="text-sm font-bold">{label}</span>
    </div>
    {value ? <div className="flex items-center gap-2"><span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{value}</span><ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" /></div> : <ChevronRight size={16} className={isDanger ? 'text-rose-300 dark:text-rose-800' : 'text-zinc-300 dark:text-zinc-600'} />}
  </div>
);

// --- 3. View Components ---

const DashboardView = ({ totalBalance, accounts, transactions, categories, onAddAccount, onViewAllTransactions, onAddTransaction }) => (
  <div className="w-full space-y-8">
    <div className="stagger-item relative p-6 md:p-8 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl overflow-hidden shadow-lg dark:shadow-none" style={{ animationDelay: '0ms' }}>
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/20 dark:bg-violet-500/25 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 dark:bg-lime-400/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[11px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Net Worth</h2><div className="flex items-center gap-1.5 px-2 py-1 bg-white/30 dark:bg-zinc-800/30 rounded-full border border-white/20"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Live</span></div></div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white"><FormatCurrency amount={totalBalance} /></h1>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-5 xl:col-span-4 space-y-5">
        <div className="flex items-center justify-between px-1"><h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Your Assets</h3><button onClick={onAddAccount} className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1"><Plus size={14} /> Add</button></div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`stagger-item p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all ${acc.type === 'checking' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : acc.type === 'savings' ? 'bg-violet-600 text-white' : 'bg-emerald-500 text-white'}`} style={{ animationDelay: `${(idx * 80) + 100}ms` }}>
              {!acc.isSynced && <CloudOff size={14} className="absolute top-4 right-4 opacity-50 animate-pulse" />}
              <div className="flex items-start justify-between mb-4 md:mb-8"><div className="w-6 h-4 rounded bg-white/20" />{acc.type === 'checking' ? <Landmark size={18} /> : <Wallet size={18} />}</div>
              <div className="text-[9px] md:text-[10px] font-bold uppercase opacity-70 mb-1">{acc.name}</div>
              <div className="text-lg sm:text-2xl font-bold truncate"><FormatCurrency amount={acc.balance} inheritColor /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-5">
        <div className="flex items-center justify-between px-1"><h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Transactions</h3><button onClick={onViewAllTransactions} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View All</button></div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-[2rem] shadow-sm overflow-hidden backdrop-blur-xl transition-colors duration-500">
          {transactions.slice(0, 5).map((txn, idx) => (
            <div key={txn.id}
              className={`stagger-item p-4 md:p-5 flex items-center justify-between transition-colors 
              ${!txn.isSynced ? 'bg-amber-50/60 dark:bg-amber-900/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'} 
              ${idx === 4 ? '' : 'border-b border-zinc-100 dark:border-zinc-800/60'}`}
              style={{ animationDelay: `${(idx * 60) + 300}ms` }}
            >
              <div className="flex items-center gap-4">
                <CategoryIcon category={txn.category} type={txn.type} categories={categories} />
                <div><h4 className="font-bold text-zinc-900 dark:text-white text-sm md:text-base">{txn.title} {!txn.isSynced && <CloudOff size={10} className="text-amber-500 inline ml-1" />}</h4><p className="text-xs font-medium text-zinc-500">{txn.category}</p></div>
              </div>
              <FormatCurrency amount={txn.amount} showSign className="font-bold text-base md:text-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <button onClick={onAddTransaction} className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-violet-600 text-white rounded-2xl md:rounded-3xl shadow-xl shadow-violet-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"><Plus size={24} /></button>
  </div>
);

const TransactionsView = ({ transactions, categories, filter, onFilterChange }) => {
  const filterOptions = ['all', 'income', 'expense'];
  const activeIndex = filterOptions.indexOf(filter);
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
      <div className="stagger-item flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1" style={{ animationDelay: '0ms' }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Transactions</h2>
        <div className="relative flex w-full sm:w-[300px] h-10 p-1 bg-zinc-200/50 dark:bg-zinc-800/60 rounded-xl backdrop-blur-xl overflow-hidden">
          <div className="absolute top-1 bottom-1 transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] bg-white dark:bg-zinc-700 rounded-lg shadow-md z-0" style={{ width: 'calc(33.33% - 3px)', transform: `translateX(calc(${activeIndex * 100}%))` }} />
          {filterOptions.map((f) => (
            <button key={f} onClick={() => onFilterChange(f)} className={`relative flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold capitalize transition-colors duration-500 z-10 ${filter === f ? (f === 'income' ? 'text-emerald-600 dark:text-lime-400' : f === 'expense' ? 'text-rose-600 dark:text-rose-500' : 'text-violet-600 dark:text-violet-400') : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900/60 rounded-[2rem] shadow-sm overflow-hidden backdrop-blur-xl">
        {transactions.filter(t => filter === 'all' || t.type === filter).map((txn, idx, arr) => (
          <div key={txn.id} className={`stagger-item p-4 md:p-5 flex items-center justify-between transition-colors ${!txn.isSynced ? 'bg-amber-50/60 dark:bg-amber-900/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'} ${idx === arr.length - 1 ? '' : 'border-b border-zinc-100 dark:border-zinc-800/60'}`} style={{ animationDelay: `${(idx * 50) + 100}ms` }}>
            <div className="flex items-center gap-4">
              <CategoryIcon category={txn.category} type={txn.type} categories={categories} />
              <div><h4 className="font-bold text-sm text-zinc-900 dark:text-white">{txn.title} {!txn.isSynced && <CloudOff size={10} className="text-amber-500 inline ml-1" />}</h4><p className="text-xs text-zinc-500">{txn.category}</p></div>
            </div>
            <FormatCurrency amount={txn.amount} showSign className="font-bold" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AddTransactionView = ({ onAdd, onCancel, accounts, categories, existingTransactions }) => {
  const [step, setStep] = useState(1);
  const [txData, setTxData] = useState({ type: 'expense', amount: '', title: '', category: '', accountId: accounts[0]?.id || 1 });

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  const filteredCategories = categories.filter(c => c.type === txData.type);
  const stepTitles = ["Set Amount", "Pick Category", "Entry Title", "Asset Source", "Final Review"];

  // UPDATED: Suggestions logic now looks up context based on the category chosen in Step 2
  const suggestions = useMemo(() => {
    // 1. Get base suggestions for the specific category
    const categorySpecificBase = CATEGORIZED_SUGGESTIONS[txData.category] || [];

    // 2. Extract unique titles from user history that match this category
    const historicalForCategory = existingTransactions
      .filter(t => t.category === txData.category)
      .map(t => t.title);

    // 3. Merge and deduplicate
    const combined = [...new Set([...historicalForCategory, ...categorySpecificBase])];

    // 4. Filter by current text input (if any)
    if (!txData.title.trim()) return combined.slice(0, 8);
    return combined
      .filter(t => t.toLowerCase().includes(txData.title.toLowerCase()))
      .slice(0, 8);
  }, [txData.title, txData.category, existingTransactions]);

  const handleSuggestionClick = (title) => {
    // UPDATED: Populates field but does NOT advance automatically
    setTxData({ ...txData, title });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20">
      <header className="stagger-item flex items-center justify-between" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onCancel : prevStep} className="p-2.5 -ml-2 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={18} className="text-zinc-900 dark:text-white" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{stepTitles[step - 1]}</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Step {step} of 5</p>
          </div>
        </div>
      </header>

      {/* Progress Line */}
      <div className="stagger-item flex gap-1.5" style={{ animationDelay: '50ms' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)] ${i <= step ? (txData.type === 'income' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.3)]') : 'bg-zinc-200 dark:bg-zinc-800'}`} />
        ))}
      </div>

      <div key={step} className="animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-[cubic-bezier(0.2,0,0,1)] fill-mode-both">
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] p-6 md:p-12 shadow-xl backdrop-blur-xl border border-white/10 text-center space-y-10">
            <div className="inline-flex p-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-[1.25rem] w-full">
              <button onClick={() => setTxData({ ...txData, type: 'expense' })} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-500 ${txData.type === 'expense' ? 'bg-white dark:bg-zinc-800 text-rose-600 shadow-sm' : 'text-zinc-500'}`}>Expense</button>
              <button onClick={() => setTxData({ ...txData, type: 'income' })} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-500 ${txData.type === 'income' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-zinc-500'}`}>Income</button>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Entry Amount</span>
              <div className="flex items-center justify-center text-5xl md:text-7xl font-black text-zinc-900 dark:text-white">
                <span className="text-zinc-300 dark:text-zinc-600 mr-2">৳</span>
                <input
                  type="number" inputMode="numeric" pattern="[0-9]*"
                  value={txData.amount} onChange={(e) => { if (/^\d*$/.test(e.target.value)) setTxData({ ...txData, amount: e.target.value }); }}
                  placeholder="0" autoFocus className="bg-transparent border-none outline-none text-center w-full max-w-[280px] focus:ring-0 p-0 placeholder-zinc-200 dark:placeholder-zinc-800"
                />
              </div>
            </div>
            <button onClick={nextStep} disabled={!txData.amount || parseInt(txData.amount, 10) <= 0} className="w-full py-5 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-2xl font-bold shadow-2xl transition-all active:scale-95 disabled:opacity-30">Continue <ChevronRight size={20} className="inline ml-1" /></button>
          </div>
        )}
        {step === 2 && (
          <div className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] p-6 shadow-xl backdrop-blur-xl border border-white/10">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredCategories.map(cat => (
                <button key={cat.id} onClick={() => { setTxData({ ...txData, category: cat.name }); nextStep(); }} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl transition-all duration-500 ${txData.category === cat.name ? 'bg-zinc-900 dark:bg-white text-white dark:text-black scale-105' : 'bg-zinc-100 dark:bg-zinc-950/50 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`} >
                  <div className={`p-3 rounded-2xl ${txData.category === cat.name ? 'bg-white/10 dark:bg-black/10' : 'bg-zinc-900 dark:bg-black'} transition-colors ${txData.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{IconMap[cat.icon] || <LayoutGrid size={16} />}</div>
                  <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] p-6 md:p-12 shadow-xl backdrop-blur-xl border border-white/10 space-y-8 min-h-[420px]">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">What was this for?</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors"><Search size={20} /></div>
                <input
                  type="text"
                  value={txData.title}
                  onChange={(e) => setTxData({ ...txData, title: e.target.value })}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && txData.title.trim()) nextStep() }}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-100 dark:bg-zinc-950 border-none rounded-[1.5rem] text-xl font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="Search or type..."
                />
              </div>
            </div>

            {/* CATEGORY-SPECIFIC SEARCH SUGGESTIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Common for {txData.category}</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-[8px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-tighter">AI Prediction</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {suggestions.map((title, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(title)}
                    className={`px-4 py-2.5 rounded-[1.15rem] text-[11px] font-black tracking-tight transition-all active:scale-95 border-2 ${txData.title === title
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent'
                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-violet-500/50'
                      }`}
                  >
                    {title}
                  </button>
                ))}
                {suggestions.length === 0 && <p className="text-xs text-zinc-400 italic py-2 px-1">No presets found. Type custom title.</p>}
              </div>
            </div>

            <button onClick={nextStep} disabled={!txData.title.trim()} className="w-full py-5 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-2xl font-bold shadow-2xl transition-all active:scale-95 disabled:opacity-30">Select Account</button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            {accounts.map(acc => (
              <button key={acc.id} onClick={() => { setTxData({ ...txData, accountId: acc.id }); nextStep(); }} className={`flex items-center justify-between p-6 w-full rounded-[2rem] transition-all duration-500 ${txData.accountId === acc.id ? 'ring-2 ring-violet-500 bg-white dark:bg-zinc-900 shadow-xl scale-[1.02]' : 'bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 shadow-sm'}`} >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${acc.type === 'checking' ? 'bg-zinc-900 text-white' : 'bg-emerald-500 text-white'}`}><Wallet size={20} /></div>
                  <span className="font-black text-zinc-900 dark:text-white tracking-tight">{acc.name}</span>
                </div>
                <FormatCurrency amount={acc.balance} className="font-bold text-lg" />
              </button>
            ))}
          </div>
        )}
        {step === 5 && (
          <div className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] p-6 md:p-12 shadow-xl backdrop-blur-xl border border-white/10 text-center space-y-10">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em]">Review Entry</p>
              <div className={`text-6xl font-black ${txData.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'} tracking-tighter`}>
                <FormatCurrency amount={txData.type === 'expense' ? -Math.abs(parseFloat(txData.amount)) : Math.abs(parseFloat(txData.amount))} showSign inheritColor />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-950/50 text-left">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Title</p>
                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{txData.title}</p>
              </div>
              <div className="p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-950/50 text-left">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Category</p>
                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{txData.category}</p>
              </div>
            </div>
            <button onClick={() => onAdd(txData)} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-2xl shadow-emerald-500/20 transition-all active:scale-95">Complete Transaction</button>
          </div>
        )}
      </div>
    </div>
  );
};

type TxnRecord = { id: number; type: string; amount: number; category: string; title: string; date: string; accountId: number; isSynced: boolean; pending?: boolean; };
type AccRecord = { id: number; name: string; balance: number; type: string; isSynced: boolean; };
const AnalyticsView = ({ transactions, accounts, totalBalance }: { transactions: TxnRecord[], accounts: AccRecord[], totalBalance: number }) => {
  const totalExp = Math.abs(transactions.filter(t => t.type === 'expense').reduce((a: number, c) => a + c.amount, 0));
  const totalInc = transactions.filter(t => t.type === 'income').reduce((a: number, c) => a + c.amount, 0);
  const net = totalInc - totalExp;
  const expByCat: Record<string, number> = transactions.filter(t => t.type === 'expense').reduce((acc: Record<string, number>, curr) => { acc[curr.category] = (acc[curr.category] || 0) + Math.abs(curr.amount); return acc; }, {});
  const sorted: [string, number][] = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
      <div className="stagger-item flex flex-col gap-1" style={{ animationDelay: '0ms' }}><h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Analytics</h2><p className="text-sm font-medium text-zinc-500">Your cash flow trends.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stagger-item col-span-2 lg:col-span-1 bg-zinc-900 p-5 rounded-[1.5rem] text-white shadow-lg"><span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block mb-4">Net Flow</span><div className="text-2xl font-extrabold"><FormatCurrency amount={net} inheritColor showSign /></div></div>
        <div className="stagger-item bg-white dark:bg-zinc-900/60 p-5 rounded-[1.5rem] shadow-sm"><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Income</span><div className="text-xl md:text-2xl font-extrabold"><FormatCurrency amount={totalInc} inheritColor /></div></div>
        <div className="stagger-item bg-white dark:bg-zinc-900/60 p-5 rounded-[1.5rem] shadow-sm"><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Expense</span><div className="text-xl md:text-2xl font-extrabold"><FormatCurrency amount={totalExp} inheritColor /></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-6 shadow-sm backdrop-blur-xl">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Top Expenses</h3>
          <div className="space-y-6">{sorted.slice(0, 5).map(([cat, amt]) => (<div key={cat} className="space-y-2"><div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white"><span>{cat}</span><FormatCurrency amount={amt} inheritColor /></div><div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${(amt / max) * 100}%` }} /></div></div>))}</div>
        </div>
        <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-6 shadow-sm backdrop-blur-xl">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Asset Distribution</h3>
          <div className="space-y-6">{accounts.map(acc => (<div key={acc.id} className="space-y-2"><div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white"><span>{acc.name}</span><FormatCurrency amount={acc.balance} inheritColor /></div><div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(acc.balance / totalBalance) * 100}%` }} /></div></div>))}</div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ userAvatar, onAvatarChange, faceId, onToggleFaceId, notifications, onToggleNotifications, onDeleteData }) => (
  <div className="max-w-2xl mx-auto w-full space-y-8 pb-20">
    <div className="stagger-item flex flex-col gap-1" style={{ animationDelay: '0ms' }}><h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Profile</h2><p className="text-sm font-medium text-zinc-500">Manage account.</p></div>
    <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
      <div className="relative group cursor-pointer inline-block" onClick={onAvatarChange}>
        <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 p-1 shadow-xl group-hover:scale-105 transition-transform duration-500">
          <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[1.25rem] overflow-hidden relative">
            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={20} className="text-white" /></div>
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center"><Check size={10} className="text-white" /></div>
      </div>
      <div className="flex-1 space-y-1"><h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">John Doe</h3><p className="text-sm font-medium text-zinc-500">john.doe@finspace.app</p></div>
    </div>
    <div className="space-y-6">
      <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-4 shadow-sm"><h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 pt-2 pb-4">Preferences</h4><SettingsRow icon={Settings} label="Currency" value="BDT (৳)" /><div className="flex items-center justify-between p-4 rounded-2xl transition-colors"><div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Bell size={18} className="text-zinc-600 dark:text-zinc-400" /></div><span className="text-sm font-bold text-zinc-900 dark:text-white">Push Notifications</span></div><Toggle active={notifications} onChange={onToggleNotifications} /></div></div>
      <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-4 shadow-sm"><h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 pt-2 pb-4">Security</h4><div className="flex items-center justify-between p-4 rounded-2xl transition-colors"><div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Shield size={18} className="text-zinc-600 dark:text-zinc-400" /></div><span className="text-sm font-bold text-zinc-900 dark:text-white">App Lock</span></div><Toggle active={faceId} onChange={onToggleFaceId} /></div><SettingsRow icon={Trash2} label="Delete All Data" onClick={onDeleteData} isDanger /></div>
    </div>
  </div>
);

// --- 4. Main App Component ---

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [userAvatar, setUserAvatar] = useState("https://i.pravatar.cc/150?img=68");
  const [syncState, setSyncState] = useState('offline');
  const [toast, setToast] = useState<{ message: string, type: string } | null>(null);
  const [faceId, setFaceId] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const totalBalance = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  const hasUnsyncedChanges = useMemo(() => transactions.some(t => !t.isSynced) || accounts.some(a => !a.isSynced), [transactions, accounts]);

  // eslint-disable-next-line
  useEffect(() => { if (hasUnsyncedChanges && syncState === 'synced') setSyncState('offline'); }, [hasUnsyncedChanges]);

  const handleSync = () => {
    if (syncState === 'syncing' || !hasUnsyncedChanges) return;
    setSyncState('syncing');
    setTimeout(() => {
      setTransactions(prev => prev.map(t => ({ ...t, isSynced: true, pending: false })));
      setAccounts(prev => prev.map(a => ({ ...a, isSynced: true })));
      setSyncState('synced');
      setToast({ message: "Data synced with cloud", type: "success" });
      setTimeout(() => { setToast(null); setSyncState('offline'); }, 3000);
    }, 1500);
  };

  const addTransaction = (txnData) => {
    const amount = parseFloat(txnData.amount);
    const val = txnData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const newTxn = { id: Date.now(), accountId: parseInt(txnData.accountId), amount: val, category: txnData.category, title: txnData.title, date: new Date().toISOString(), type: txnData.type, isSynced: false, pending: true };
    setAccounts(prev => prev.map(acc => acc.id === newTxn.accountId ? { ...acc, balance: acc.balance + val, isSynced: false } : acc));
    setTransactions(prev => [newTxn, ...prev]);
    setCurrentView('dashboard');
  };

  const handleAvatarChange = () => {
    const newId = Math.floor(Math.random() * 70);
    setUserAvatar(`https://i.pravatar.cc/150?img=${newId}`);
    setToast({ message: "Avatar updated", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = (e) => {
    const x = e.clientX; const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    if (!document.startViewTransition) { setIsDark(prev => !prev); return; }
    const transition = document.startViewTransition(() => { flushSync(() => setIsDark(prev => !prev)); });
    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate({ clipPath }, { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' });
    });
  };

  const activeNavIndex = NAV_ITEMS_MAP.findIndex(item => item.id === currentView);

  return (
    <div className={isDark ? 'dark' : ''}>
      <style>{`
        @keyframes smoothStack { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .stagger-item { opacity: 0; animation: smoothStack 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .nav-transition { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
        ::view-transition-old(root) { z-index: 1; } ::view-transition-new(root) { z-index: 2147483646; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.3); border-radius: 10px; }
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300"><div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-zinc-900 text-white border border-white/10"><Check size={18} className="text-emerald-400" /><span className="text-sm font-bold">{toast.message}</span></div></div>)}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
            <h3 className="text-xl font-extrabold mb-2 text-zinc-900 dark:text-white">Clear all data?</h3>
            <p className="text-sm text-zinc-500 mb-8 px-4">This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setTransactions([]); setAccounts(INITIAL_ACCOUNTS.map(a => ({ ...a, balance: 0 }))); setIsDeleteModalOpen(false); setCurrentView('dashboard'); setToast({ message: "Data cleared", type: "info" }); }} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95">Clear everything</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 font-sans flex flex-col md:flex-row transition-colors duration-500">
        <nav className="fixed bottom-0 w-full md:w-[240px] md:relative bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-zinc-200/50 dark:border-zinc-800/50 z-40 pb-safe md:pb-0">
          <div className="flex flex-row md:flex-col h-full md:min-h-screen p-2 md:p-5 justify-around md:justify-start">
            <div className="hidden md:flex items-center gap-2.5 mb-10 px-2 pt-3"><div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-sm font-extrabold shadow-md">F</div><span className="font-extrabold text-xl tracking-tighter text-zinc-900 dark:text-white">FinSpace</span></div>
            <div className="relative flex flex-row md:flex-col w-full justify-evenly md:justify-start z-10">
              {activeNavIndex >= 0 && (
                <>
                  <div className="md:hidden absolute top-0 w-[25%] h-full nav-transition -z-10 flex items-center justify-center" style={{ left: `${activeNavIndex * 25}%` }}>
                    <div className="w-[85%] h-[85%] bg-violet-100 dark:bg-zinc-800/80 rounded-[1.25rem]" />
                  </div>
                  <div className="hidden md:block absolute left-0 w-full h-[64px] nav-transition -z-10" style={{ top: `${activeNavIndex * 64}px` }}>
                    <div className="w-full h-full bg-violet-100 dark:bg-zinc-800/80 rounded-2xl" />
                  </div>
                </>
              )}
              {NAV_ITEMS_MAP.map(item => (<button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full h-[64px] flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-5 rounded-2xl flex-1 md:flex-none justify-center md:justify-start nav-transition group ${currentView === item.id ? 'text-violet-700 dark:text-white font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 font-medium'}`}><item.icon size={20} className={`nav-transition ${currentView === item.id ? 'scale-110' : 'group-hover:scale-105'}`} /><span className="text-[10px] md:text-sm tracking-wide truncate">{item.label}</span></button>))}
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
          <header className="sticky top-0 z-30 px-5 md:px-8 py-4 flex items-center justify-between"><div className="md:hidden w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white font-extrabold shadow-md">F</div><div className="ml-auto flex items-center gap-3 md:gap-4"><SyncIndicator hasUnsyncedChanges={hasUnsyncedChanges} syncState={syncState} pendingCount={transactions.filter(t => !t.isSynced).length} onSync={handleSync} /><button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-transform active:scale-95">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button><div onClick={() => setCurrentView('profile')} className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 border-[2px] border-[#F4F4F5] dark:border-[#09090B] shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden"><img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /></div></div></header>
          <div className="p-5 md:p-8 lg:p-10 pb-32 md:pb-12 max-w-[1200px] mx-auto w-full relative">
            {currentView === 'dashboard' && <DashboardView totalBalance={totalBalance} accounts={accounts} transactions={transactions} categories={HARDCODED_CATEGORIES} onAddAccount={() => setCurrentView('addAccount')} onViewAllTransactions={() => setCurrentView('transactions')} onAddTransaction={() => setCurrentView('addTransaction')} />}
            {currentView === 'transactions' && <TransactionsView transactions={transactions} categories={HARDCODED_CATEGORIES} filter={transactionFilter} onFilterChange={setTransactionFilter} />}
            {currentView === 'analytics' && <AnalyticsView transactions={transactions} accounts={accounts} totalBalance={totalBalance} />}
            {currentView === 'addTransaction' && <AddTransactionView onAdd={addTransaction} onCancel={() => setCurrentView('dashboard')} accounts={accounts} categories={HARDCODED_CATEGORIES} existingTransactions={transactions} />}
            {currentView === 'addAccount' && <div className="max-w-xl mx-auto space-y-8 pb-20"><div className="flex items-center gap-3"><button onClick={() => setCurrentView('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><ArrowLeft size={20} /></button><h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Add Asset</h2></div><form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); setAccounts([...accounts, { id: Date.now(), name: formData.get('name') as string, balance: parseFloat(formData.get('balance') as string), type: formData.get('type') as string, isSynced: false }]); setCurrentView('dashboard'); }} className="bg-white dark:bg-zinc-900/60 rounded-[2rem] p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-6"><input type="text" name="name" required className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900 dark:text-white" placeholder="Account Name" /><input type="number" name="balance" step="1" required className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900 dark:text-white" placeholder="Initial Balance ৳" /><div className="grid grid-cols-3 gap-2">{['checking', 'savings', 'cash'].map(type => (<label key={type} className="cursor-pointer text-center"><input type="radio" name="type" value={type} className="peer sr-only" defaultChecked={type === 'checking'} /><div className="py-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs font-bold peer-checked:bg-violet-600 peer-checked:text-white capitalize transition-all">{type}</div></label>))}</div><div className="pt-4 flex gap-3"><button type="button" onClick={() => setCurrentView('dashboard')} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 transition-all active:scale-95">Cancel</button><button type="submit" className="flex-[2] py-4 bg-violet-600 text-white rounded-xl font-bold transition-all active:scale-95">Add Asset</button></div></form></div>}
            {currentView === 'profile' && <ProfileView userAvatar={userAvatar} onAvatarChange={handleAvatarChange} faceId={faceId} onToggleFaceId={() => setFaceId(!faceId)} notifications={notifications} onToggleNotifications={() => setNotifications(!notifications)} onDeleteData={() => setIsDeleteModalOpen(true)} />}
          </div>
        </main>
      </div>
    </div>
  );
}