// @ts-nocheck
import { useState, useMemo } from 'react';
import { Plus, Landmark, Wallet, CloudOff, Search, PieChart, Check, Camera, Settings, Bell, Shield, Trash2, ArrowLeft, AlertCircle, ChevronRight, LayoutGrid } from 'lucide-react';
import { FormatCurrency, CategoryIcon, SyncIndicator, Toggle, SettingsRow } from '../components/Shared';
import { IconMap, CATEGORIZED_SUGGESTIONS } from '../constants';

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
export default AddTransactionView;