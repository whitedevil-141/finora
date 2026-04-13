// @ts-nocheck
import { useState, useMemo } from 'react';
import { Plus, Landmark, Wallet, CloudOff, Search, PieChart, Check, Camera, Settings, Bell, Shield, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { FormatCurrency, CategoryIcon, SyncIndicator, Toggle, SettingsRow } from '../components/Shared';
import { IconMap, CATEGORIZED_SUGGESTIONS } from '../constants';
import type { TxnRecord, AccRecord } from '../types';
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
export default AnalyticsView;