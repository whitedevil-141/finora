// @ts-nocheck
import { useState, useMemo } from 'react';
import { Plus, Landmark, Wallet, CloudOff, Search, PieChart, Check, Camera, Settings, Bell, Shield, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { FormatCurrency, CategoryIcon, SyncIndicator, Toggle, SettingsRow } from '../components/Shared';
import { IconMap, CATEGORIZED_SUGGESTIONS } from '../constants';

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
export default TransactionsView;