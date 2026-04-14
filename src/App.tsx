// @ts-nocheck
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Check, AlertCircle, Moon, Sun, Wallet, Landmark, PieChart, ArrowLeft, LogOut } from 'lucide-react';
import { flushSync } from 'react-dom';
import { NAV_ITEMS_MAP, HARDCODED_CATEGORIES } from './constants';
import { 
  fetchAccounts, 
  fetchTransactions, 
  createAccount, 
  createTransaction, 
  updateUser,
  deleteAllData,
  createAccountWithOfflineSupport,
  createTransactionWithOfflineSupport,
  updateUserWithOfflineSupport,
  processPendingActions,
  isOnlineNow,
} from './api';
import { OfflineSyncManager } from './utils/offlineSync';
import { useAuth } from './context/AuthContext';
import LoginPage from './views/LoginPage';
import OAuthCallback from './views/OAuthCallback';
import LogoImage from './assets/logo.png';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import AddTransactionView from './views/AddTransactionView';
import AnalyticsView from './views/AnalyticsView';
import ProfileView from './views/ProfileView';

export default function App() {
  const { user, isAuthenticated, isInitializing, logout, refreshUser } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage
    const savedTheme = localStorage.getItem('finora_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode
    return true;
  });
  const getBasePath = () => {
    // Get the base path from the app (accounts for /finora/ on GitHub Pages)
    const base = import.meta.env.BASE_URL || '/';
    return base === '/' ? '' : base.replace(/\/$/, '');
  };

  const [currentView, _setCurrentView] = useState(() => {
    const basePath = getBasePath();
    let path = window.location.pathname;
    
    // Remove base path if it exists
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    
    // Remove leading slashes
    path = path.replace(/^\/+/, '');
    
    return path ? (path === 'home' ? 'dashboard' : path) : 'dashboard';
  });

  const setCurrentView = useCallback((view: string) => {
    _setCurrentView(view);
    const basePath = getBasePath();
    const path = view === 'dashboard' ? 'home' : view;
    const fullPath = basePath ? `${basePath}/${path}` : `/${path}`;
    window.history.pushState(null, '', fullPath);
  }, []);

  // Check if this is the OAuth callback route
  const isOAuthCallback = useMemo(() => {
    // First check if id_token is in hash (OAuth callback from 404 redirect)
    const hash = window.location.hash;
    if (hash.includes('id_token=')) {
      return true;
    }
    
    // Otherwise check pathname for oauth-callback route
    const basePath = getBasePath();
    let path = window.location.pathname;
    
    // Remove base path if it exists
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    
    path = path.replace(/^\/+/, '');
    return path === 'oauth-callback';
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const basePath = getBasePath();
      let path = window.location.pathname;
      
      // Remove base path if it exists
      if (basePath && path.startsWith(basePath)) {
        path = path.slice(basePath.length);
      }
      
      path = path.replace(/^\/+/, '');
      _setCurrentView(path ? (path === 'home' ? 'dashboard' : path) : 'dashboard');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: string } | null>(null);
  const [faceId, setFaceId] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const avatarRef = useRef<HTMLDivElement>(null);

  const cacheKeys = useMemo(() => {
    const suffix = user?.id || 'default';
    return {
      accountsKey: `finora_accounts_cache_${suffix}`,
      transactionsKey: `finora_transactions_cache_${suffix}`,
    };
  }, [user?.id]);

  const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const normalizeAccount = (acc: any, forceSynced = false) => ({
    ...acc,
    balance: Number(acc.balance ?? 0),
    isSynced: forceSynced ? true : (acc.isSynced ?? acc.is_synced ?? true),
  });
  const normalizeTransaction = (txn: any, forceSynced = false) => ({
    ...txn,
    amount: Number(txn.amount ?? 0),
    accountId: txn.accountId ?? txn.account_id,
    isSynced: forceSynced ? true : (txn.isSynced ?? txn.is_synced ?? true),
    pending: txn.pending ?? false,
  });

  const readCache = useCallback((key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((key: string, value: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota or serialization errors
    }
  }, []);

  // Update avatar from auth user
  useEffect(() => {
    if (user?.avatar_url) {
      setUserAvatar(user.avatar_url);
    }
  }, [user?.avatar_url]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Skip if auth is still initializing or user is not authenticated
    if (isInitializing || !isAuthenticated) {
      if (!isInitializing && !isAuthenticated) {
        setIsLoading(false);
      }
      return;
    }

    const cachedAccounts = readCache(cacheKeys.accountsKey);
    const cachedTransactions = readCache(cacheKeys.transactionsKey);
    if (cachedAccounts) {
      setAccounts(cachedAccounts.map((acc) => normalizeAccount(acc, false)));
    }
    if (cachedTransactions) {
      setTransactions(cachedTransactions.map((txn) => normalizeTransaction(txn, false)));
    }

    if (!isOnline) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [accs, txns] = await Promise.all([
          fetchAccounts(),
          fetchTransactions(),
        ]);
        if (accs) {
          const normalizedAccounts = accs.map((acc) => normalizeAccount(acc, true));
          setAccounts(normalizedAccounts);
          writeCache(cacheKeys.accountsKey, normalizedAccounts);
        }
        if (txns) {
          const normalizedTransactions = txns.map((txn) => normalizeTransaction(txn, true));
          setTransactions(normalizedTransactions);
          writeCache(cacheKeys.transactionsKey, normalizedTransactions);
        }
      } catch (err) {
        console.error("API Error - using cached data fallback", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isInitializing, isAuthenticated, isOnline, cacheKeys.accountsKey, cacheKeys.transactionsKey, readCache, writeCache]);

  useEffect(() => {
    if (!isAuthenticated) return;
    writeCache(cacheKeys.accountsKey, accounts);
    writeCache(cacheKeys.transactionsKey, transactions);
  }, [accounts, transactions, isAuthenticated, cacheKeys.accountsKey, cacheKeys.transactionsKey, writeCache]);

  const totalBalance = useMemo(() => accounts.reduce((acc, curr) => acc + Number(curr.balance ?? 0), 0), [accounts]);

  const syncPendingData = useCallback(async (accountsSnapshot = accounts, transactionsSnapshot = transactions) => {
    if (!isOnline) return;

    const pendingAccounts = accountsSnapshot.filter((a) => !a.isSynced);
    const pendingTransactions = transactionsSnapshot.filter((t) => !t.isSynced);
    if (!pendingAccounts.length && !pendingTransactions.length) return;

    try {
      let didSync = false;
      let nextAccounts = accountsSnapshot.map((acc) => ({ ...acc }));
      let nextTransactions = transactionsSnapshot.map((txn) => ({ ...txn }));
      const accountIdMap = new Map<any, string>();
      const pendingTxByAccount = new Map<any, any[]>();

      pendingTransactions.forEach((txn) => {
        const key = txn.accountId;
        if (!pendingTxByAccount.has(key)) pendingTxByAccount.set(key, []);
        pendingTxByAccount.get(key)?.push(txn);
      });

      for (const acc of pendingAccounts) {
        if (isUuid(String(acc.id))) continue;
        const txnsForAcc = pendingTxByAccount.get(acc.id) || [];
        const delta = txnsForAcc.reduce((sum, txn) => sum + Number(txn.amount ?? 0), 0);
        const baseBalance = Number(acc.balance ?? 0) - delta;
        const saved = await createAccount({ name: acc.name, balance: baseBalance, type: acc.type });
        accountIdMap.set(acc.id, saved.id);
        didSync = true;
        nextAccounts = nextAccounts.map((a) => a.id === acc.id ? { ...a, id: saved.id, isSynced: true } : a);
      }

      if (accountIdMap.size > 0) {
        nextTransactions = nextTransactions.map((txn) => (
          accountIdMap.has(txn.accountId)
            ? { ...txn, accountId: accountIdMap.get(txn.accountId) }
            : txn
        ));
      }

      for (const txn of nextTransactions.filter((t) => !t.isSynced)) {
        const accountId = txn.accountId;
        if (!isUuid(String(accountId))) continue;

        const savedTxn = await createTransaction({
          account_id: accountId,
          amount: Number(txn.amount ?? 0),
          category: txn.category,
          title: txn.title,
          type: txn.type,
          date: txn.date,
        });
        const normalizedTxn = normalizeTransaction(savedTxn, true);
        didSync = true;
        nextTransactions = nextTransactions.map((t) => t.id === txn.id
          ? { ...t, ...normalizedTxn, accountId, isSynced: true, pending: false }
          : t
        );
        nextAccounts = nextAccounts.map((a) => a.id === accountId ? { ...a, isSynced: true } : a);
      }

      setAccounts(nextAccounts);
      setTransactions(nextTransactions);
      if (didSync) {
        setToast({ message: "Synced with cloud", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      console.error("Auto-sync failed", e);
    }
  }, [accounts, transactions, isOnline, isSyncing]);

  useEffect(() => {
    if (!isOnline) return;
    syncPendingData();
    syncOfflineQueue();
  }, [isOnline, syncPendingData]);

  /**
   * Process offline queue (localStorage) and sync with server
   */
  const syncOfflineQueue = useCallback(async () => {
    const pendingCount = OfflineSyncManager.getPendingActionsCount();
    if (pendingCount === 0) return;
    try {
      const result = await processPendingActions({
        onActionStart: (action) => {
          console.log(`Syncing ${action.entity}/${action.type}:`, action);
        },
        onActionSuccess: (action) => {
          console.log(`Synced ${action.entity}/${action.type}`);
        },
        onActionError: (action, error) => {
          console.error(`Failed to sync ${action.entity}/${action.type}:`, error);
        },
      });

      if (result.successful > 0) {
        setToast({
          message: `Synced ${result.successful} offline action${result.successful !== 1 ? 's' : ''}`,
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
        // Refresh data from server after successful sync
        const [accs, txns] = await Promise.all([fetchAccounts(), fetchTransactions()]);
        if (accs) {
          const normalizedAccounts = accs.map((acc) => normalizeAccount(acc, true));
          setAccounts(normalizedAccounts);
          writeCache(cacheKeys.accountsKey, normalizedAccounts);
        }
        if (txns) {
          const normalizedTransactions = txns.map((txn) => normalizeTransaction(txn, true));
          setTransactions(normalizedTransactions);
          writeCache(cacheKeys.transactionsKey, normalizedTransactions);
        }
      }

      if (result.failed > 0) {
        setToast({
          message: `Failed to sync ${result.failed} action${result.failed !== 1 ? 's' : ''} — will retry later`,
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      console.error('Offline queue sync failed', e);
    }
  }, [cacheKeys, writeCache]);

  // Background sync for newly created items (optimistic updates)
  const syncNewItemInBackground = useCallback((tempId: string, itemType: 'account' | 'transaction', accountsSnapshot: any[], transactionsSnapshot: any[]) => {
    // Fire-and-forget: don't await, don't block UI
    (async () => {
      try {
        if (itemType === 'transaction') {
          const txn = transactionsSnapshot.find((t) => t.id === tempId);
          if (!txn || !txn.accountId || !isUuid(String(txn.accountId))) return;

          const savedTxn = await createTransaction({
            account_id: txn.accountId,
            amount: Number(txn.amount ?? 0),
            category: txn.category,
            title: txn.title,
            type: txn.type,
            date: txn.date,
          });
          const normalizedTxn = normalizeTransaction(savedTxn, true);
          setTransactions((prev) => prev.map((t) => t.id === tempId ? { ...t, ...normalizedTxn, isSynced: true, pending: false } : t));
          setAccounts((prev) => prev.map((a) => a.id === txn.accountId ? { ...a, isSynced: true } : a));
        } else if (itemType === 'account') {
          const acc = accountsSnapshot.find((a) => a.id === tempId);
          if (!acc) return;

          const saved = await createAccount({ name: acc.name, balance: acc.balance, type: acc.type });
          setAccounts((prev) => prev.map((a) => a.id === tempId ? { ...a, id: saved.id, isSynced: true } : a));
          // Update transactions with new account ID
          setTransactions((prev) => prev.map((t) => (t.accountId === tempId ? { ...t, accountId: saved.id } : t)));
        }
      } catch (error) {
        console.error(`Failed to sync ${itemType}:`, error);
        // Keep item marked as unsynced so it retries on next sync
      }
    })();
  }, [normalizeTransaction]);

  const addTransaction = async (txnData) => {
    const amount = parseFloat(txnData.amount);
    const val = txnData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newTxn = { id: tempId, accountId: txnData.accountId, amount: val, category: txnData.category, title: txnData.title, date: new Date().toISOString(), type: txnData.type, isSynced: false, pending: true };
    const nextAccounts = accounts.map((acc) => acc.id === newTxn.accountId
      ? { ...acc, balance: Number(acc.balance ?? 0) + val, isSynced: false }
      : acc
    );
    const nextTransactions = [newTxn, ...transactions];

    setAccounts(nextAccounts);
    setTransactions(nextTransactions);
    setCurrentView('dashboard');

    if (!isOnline) {
      setToast({ message: "Saved offline. Will sync when online.", type: "info" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Background sync - don't await, UI already updated
    syncNewItemInBackground(tempId, 'transaction', nextAccounts, nextTransactions);
  };

  const handleAvatarChange = () => {
    // Open file picker for avatar upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;
      try {
        const { uploadAvatar } = await import('./api');
        const result = await uploadAvatar(user.id, file);
        if (result.avatar_url) {
          setUserAvatar(result.avatar_url);
          setToast({ message: "Avatar updated", type: "success" });
          setTimeout(() => setToast(null), 3000);
        }
      } catch (err) {
        console.error("Avatar upload failed", err);
        setToast({ message: "Failed to upload avatar", type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    };
    input.click();
  };

  const handleNameUpdate = useCallback(async (nextName: string) => {
    if (!user) return false;
    const trimmed = nextName.trim();
    if (!trimmed) return false;
    if (trimmed === user.name) return true;
    try {
      await updateUser(user.id, { name: trimmed });
      await refreshUser();
      setToast({ message: "Name updated", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return true;
    } catch (err) {
      console.error("Name update failed", err);
      setToast({ message: "Failed to update name", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return false;
    }
  }, [user, refreshUser]);

  const handleAvatarRemove = useCallback(async () => {
    if (!user) return false;
    const previousAvatar = userAvatar;
    setUserAvatar("");
    try {
      await updateUser(user.id, { avatar_url: null });
      await refreshUser();
      setToast({ message: "Avatar removed", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return true;
    } catch (err) {
      console.error("Avatar removal failed", err);
      setUserAvatar(previousAvatar);
      setToast({ message: "Failed to remove avatar", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return false;
    }
  }, [user, userAvatar, refreshUser]);

  const toggleTheme = (e) => {
    const x = e.clientX; const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const newTheme = !isDark;
    
    if (!document.startViewTransition) { 
      setIsDark(newTheme);
      // Save to localStorage only
      localStorage.setItem('finora_theme', newTheme ? 'dark' : 'light');
      return; 
    }
    
    document.documentElement.classList.add('vt-active');
    const transition = document.startViewTransition(() => { 
      flushSync(() => setIsDark(newTheme)); 
    });
    
    // Save to localStorage only
    localStorage.setItem('finora_theme', newTheme ? 'dark' : 'light');
    
    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate({ clipPath }, { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' });
    });
    transition.finished.then(() => {
      document.documentElement.classList.remove('vt-active');
    });
  };

  const navigateToProfile = useCallback(() => {
    if (currentView === 'profile') return;
    const el = avatarRef.current;
    if (!el) { setCurrentView('profile'); return; }
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    if (!(document as any).startViewTransition) { setCurrentView('profile'); return; }

    document.documentElement.classList.add('vt-active');
    const transition = (document as any).startViewTransition(() => {
      flushSync(() => setCurrentView('profile'));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    transition.finished.then(() => {
      document.documentElement.classList.remove('vt-active');
    });
  }, [currentView]);

  const activeNavIndex = NAV_ITEMS_MAP.findIndex(item => item.id === currentView);
  const avatarLabel = (user?.name || user?.email || 'U').trim();
  const avatarInitial = avatarLabel ? avatarLabel[0].toUpperCase() : 'U';

  // Handle OAuth callback route
  if (isOAuthCallback) {
    return <OAuthCallback />;
  }

  if (isInitializing) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden">
              <img src={LogoImage} alt="Finora" className="w-full h-full object-contain" />
            </div>
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage isDark={isDark} toggleTheme={toggleTheme} />;
  }

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
        .vt-active *, .vt-active *::before, .vt-active *::after {
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300"><div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-zinc-900 text-white border border-white/10"><Check size={18} className="text-emerald-400" /><span className="text-sm font-bold">{toast.message}</span></div></div>)}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
            <h3 className="text-xl font-extrabold mb-2 text-zinc-900 dark:text-white">Clear all data?</h3>
            <p className="text-sm text-zinc-500 mb-8 px-4">This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={async () => {
                try {
                  await deleteAllData();
                  setTransactions([]);
                  setAccounts([]);
                  setIsDeleteModalOpen(false);
                  setCurrentView('dashboard');
                  setToast({ message: "All data deleted", type: "success" });
                  setTimeout(() => setToast(null), 3000);
                } catch (err) {
                  console.error('Delete failed', err);
                  setToast({ message: "Failed to delete data", type: "error" });
                  setTimeout(() => setToast(null), 3000);
                }
              }} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95">Clear everything</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 font-sans flex flex-col md:flex-row transition-colors duration-500">
        <nav className="fixed bottom-0 w-full md:w-[240px] md:relative bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-zinc-200/50 dark:border-zinc-800/50 z-40 pb-safe md:pb-0">
          <div className="flex flex-row md:flex-col h-full md:min-h-screen p-2 md:p-5 justify-around md:justify-start">
            <div className="hidden md:flex items-center gap-3 mb-10 px-2 pt-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center -ml-1">
                <img src={LogoImage} alt="Finora Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-zinc-900 dark:text-white">Finora</span>
            </div>
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
          <header className="sticky top-0 z-30 px-5 md:px-8 py-5 md:py-6 flex items-center justify-between"><div className="md:hidden flex flex-shrink-0 items-center justify-center w-12 h-12 bg-white/80 dark:bg-zinc-800/80 rounded-[1rem] shadow-sm border border-white/40 dark:border-white/5 p-1.5 backdrop-blur-md"><img src={LogoImage} alt="Finora Logo" className="w-full h-full object-contain drop-shadow-sm" /></div><div className="ml-auto flex items-center gap-3 md:gap-4"><button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 transition-transform active:scale-95 border border-zinc-300/50 dark:border-white/5 backdrop-blur-md">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button><div ref={avatarRef} onClick={navigateToProfile} className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border-[2px] border-[#F4F4F5] dark:border-[#09090B] shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden">{userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{avatarInitial}</span>}</div></div></header>
          {!isOnline && (
            <div className="sticky top-20 z-20 px-5 md:px-8">
              <div className="mt-2 mb-2 flex items-center gap-2 rounded-2xl bg-amber-100/80 dark:bg-amber-400/10 border border-amber-200/70 dark:border-amber-400/20 px-4 py-3 text-amber-900 dark:text-amber-200 shadow-sm">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-300" />
                <span className="text-xs font-bold">Offline mode: Changes saved locally and will sync when online.</span>
              </div>
            </div>
          )}
          {OfflineSyncManager.getPendingActionsCount() > 0 && isOnline && !isSyncing && (
            <div className="sticky top-20 z-20 px-5 md:px-8">
              <div className="mt-2 mb-2 flex items-center justify-between rounded-2xl bg-blue-100/80 dark:bg-blue-400/10 border border-blue-200/70 dark:border-blue-400/20 px-4 py-3 text-blue-900 dark:text-blue-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-blue-600 dark:text-blue-300" />
                  <span className="text-xs font-bold">{OfflineSyncManager.getPendingActionsCount()} pending change{OfflineSyncManager.getPendingActionsCount() !== 1 ? 's' : ''} ready to sync</span>
                </div>
              </div>
            </div>
          )}
          <div className="p-5 md:p-8 lg:p-10 pb-32 md:pb-12 max-w-[1200px] mx-auto w-full relative">
            {currentView === 'dashboard' && <DashboardView totalBalance={totalBalance} accounts={accounts} transactions={transactions} categories={HARDCODED_CATEGORIES} onAddAccount={() => setCurrentView('addAccount')} onViewAllTransactions={() => setCurrentView('transactions')} onAddTransaction={() => setCurrentView('addTransaction')} />}
            {currentView === 'transactions' && <TransactionsView transactions={transactions} categories={HARDCODED_CATEGORIES} filter={transactionFilter} onFilterChange={setTransactionFilter} />}
            {currentView === 'analytics' && <AnalyticsView transactions={transactions} accounts={accounts} totalBalance={totalBalance} />}
            {currentView === 'addTransaction' && <AddTransactionView onAdd={addTransaction} onCancel={() => setCurrentView('dashboard')} accounts={accounts} categories={HARDCODED_CATEGORIES} existingTransactions={transactions} />}
            {currentView === 'addAccount' && <div className="max-w-xl mx-auto space-y-6 md:space-y-8 pb-20">
              <header className="stagger-item flex items-center gap-3" style={{ animationDelay: '0ms' }}>
                <button onClick={() => setCurrentView('dashboard')} className="p-2 -ml-2 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                  <ArrowLeft size={16} className="text-zinc-900 dark:text-white" />
                </button>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Add New Asset</h2>
                  <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Create a new account</p>
                </div>
              </header>

              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.target as HTMLFormElement); 
                const newAcc = { name: formData.get('name') as string, balance: parseFloat(formData.get('balance') as string), type: formData.get('type') as string };

                // Optimistic UI update
                const tempId = `temp-${Date.now()}`;
                const nextAccounts = [...accounts, { id: tempId, ...newAcc, isSynced: false }];
                setAccounts(nextAccounts);
                setCurrentView('dashboard');

                if (!isOnline) {
                  setToast({ message: "Saved offline. Will sync when online.", type: "info" });
                  setTimeout(() => setToast(null), 3000);
                  return;
                }

                // Background sync - don't await, UI already updated
                syncNewItemInBackground(tempId, 'account', nextAccounts, transactions);
              }} className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-xl backdrop-blur-xl border border-white/10 space-y-6 md:space-y-8" style={{ animationDelay: '80ms' }}>

                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Account Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors"><Wallet size={16} /></div>
                    <input type="text" name="name" required autoFocus className="w-full pl-11 md:pl-13 pr-4 md:pr-5 py-4 md:py-5 bg-zinc-100 dark:bg-zinc-950/80 border-2 border-transparent rounded-[1.25rem] md:rounded-[1.5rem] text-sm md:text-base font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all" placeholder="e.g. Main Bank, Cash Wallet" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Initial Balance</label>
                  <div className="relative group">
                    <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors font-extrabold text-base md:text-lg">৳</div>
                    <input type="number" name="balance" step="1" required className="w-full pl-11 md:pl-13 pr-4 md:pr-5 py-4 md:py-5 bg-zinc-100 dark:bg-zinc-950/80 border-2 border-transparent rounded-[1.25rem] md:rounded-[1.5rem] text-sm md:text-base font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Account Type</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">{['checking', 'savings', 'cash'].map(type => (
                    <label key={type} className="cursor-pointer text-center group">
                      <input type="radio" name="type" value={type} className="peer sr-only" defaultChecked={type === 'checking'} />
                      <div className="flex flex-col items-center gap-2 p-3 md:p-5 bg-zinc-100 dark:bg-zinc-950/50 rounded-xl md:rounded-2xl border-2 border-transparent peer-checked:bg-violet-600 peer-checked:border-violet-600 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-violet-500/20 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 capitalize transition-all duration-300 active:scale-95">
                        <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 peer-checked:bg-white/20 transition-colors">
                          {type === 'checking' ? <Landmark size={16} /> : type === 'savings' ? <PieChart size={16} /> : <Wallet size={16} />}
                        </div>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tight">{type}</span>
                      </div>
                    </label>
                  ))}</div>
                </div>

                <div className="pt-1 md:pt-2 flex gap-2.5 md:gap-3">
                  <button type="button" onClick={() => setCurrentView('dashboard')} className="flex-1 py-4 md:py-5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl md:rounded-2xl font-bold text-sm md:text-base text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 md:py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-2xl shadow-violet-500/20 transition-all active:scale-95">Add Asset</button>
                </div>
              </form>
            </div>}
            {currentView === 'profile' && <ProfileView userAvatar={userAvatar} onAvatarChange={handleAvatarChange} onAvatarRemove={handleAvatarRemove} faceId={faceId} onToggleFaceId={() => setFaceId(!faceId)} notifications={notifications} onToggleNotifications={() => setNotifications(!notifications)} onDeleteData={() => setIsDeleteModalOpen(true)} userName={user?.name} userEmail={user?.email} onLogout={logout} onNameUpdate={handleNameUpdate} isOnline={isOnline} />}
          </div>
        </main>
      </div>
    </div>
  );
}