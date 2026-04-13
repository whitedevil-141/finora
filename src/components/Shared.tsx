// @ts-nocheck
import { ElementType } from 'react';
import { Wallet, CloudOff, CheckCircle2, RefreshCw, ChevronRight, LayoutGrid } from 'lucide-react';
import { IconMap } from '../constants';

export const FormatCurrency = ({ amount, showSign = false, inheritColor = false, className = "" }) => {
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

export const CategoryIcon = ({ category, type, categories }) => {
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

export const SyncIndicator = ({ hasUnsyncedChanges, syncState, pendingCount, onSync }) => {
  if (!hasUnsyncedChanges && syncState !== 'syncing') return null;
  return (
    <button onClick={onSync} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs tracking-wider font-bold uppercase transition-all duration-300 ${syncState === 'syncing' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400' : syncState === 'synced' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:scale-105'}`}>
      {syncState === 'syncing' ? <><RefreshCw size={12} className="animate-spin" /> Syncing</> : syncState === 'synced' ? <><CheckCircle2 size={12} /> Synced</> : <><CloudOff size={12} /> {pendingCount} Pending</>}
    </button>
  );
};

export const Toggle = ({ active, onChange }) => (
  <div onClick={onChange} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-violet-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </div>
);

export const SettingsRow = ({ icon: Icon, label, value, onClick, isDanger }: { icon: ElementType, label: string, value?: string, onClick?: () => void, isDanger?: boolean }) => (
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