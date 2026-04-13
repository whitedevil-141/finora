// @ts-nocheck
import { useState, useMemo } from 'react';
import { Plus, Landmark, Wallet, CloudOff, Search, PieChart, Check, Camera, Settings, Bell, Shield, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { FormatCurrency, CategoryIcon, SyncIndicator, Toggle, SettingsRow } from '../components/Shared';
import { IconMap, CATEGORIZED_SUGGESTIONS } from '../constants';

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
        {transactions.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </div>
    <button onClick={onAddTransaction} className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-violet-600 text-white rounded-2xl md:rounded-3xl shadow-xl shadow-violet-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"><Plus size={24} /></button>
  </div>
);
export default DashboardView;