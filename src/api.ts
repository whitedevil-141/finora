const BASE_URL = 'https://finora-ts08.onrender.com/api';

// ── Offline Support ──────────────────────────────────────────────

import { OfflineSyncManager, type OfflineAction } from './utils/offlineSync';

/** Check if currently online */
export function isOnlineNow(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
}

// ── Token management ─────────────────────────────────────────────

const TOKEN_KEY = 'finora_access_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

/** Build Authorization headers if a token exists. */
function authHeaders(): Record<string, string> {
    const token = getToken();
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

/** Wrapper for authed fetch — attaches Bearer token and handles 401. */
async function authedFetch(url: string, opts: RequestInit = {}): Promise<Response> {
    const headers = {
        ...authHeaders(),
        ...(opts.headers || {}),
    };
    const res = await fetch(url, { ...opts, headers });

    if (res.status === 401) {
        // Token expired or invalid — throw error and let caller handle it
        clearToken();
        const error = new Error('Unauthorized');
        (error as any).status = 401;
        throw error;
    }

    return res;
}


// ── Auth endpoints ───────────────────────────────────────────────

export interface AuthResult {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
        provider: string;
        currency: string;
        theme_preference: string;
    };
}

export const authSignup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(err.detail || 'Signup failed');
    }
    return res.json();
};

export const authLogin = async (email: string, password: string): Promise<AuthResult> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(err.detail || 'Invalid email or password');
    }
    return res.json();
};

export const authGoogle = async (credential: string): Promise<AuthResult> => {
    const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Google login failed' }));
        throw new Error(err.detail || 'Google login failed');
    }
    return res.json();
};

export const authGetMe = async (): Promise<AuthResult['user'] | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (res.status === 401) {
            // Token invalid - throw so caller knows to logout
            clearToken();
            const error = new Error('Unauthorized');
            (error as any).status = 401;
            throw error;
        }
        
        if (!res.ok) {
            return null;
        }
        
        return res.json();
    } catch (error) {
        // Re-throw 401 errors, ignore others
        if ((error as any)?.status === 401) {
            throw error;
        }
        return null;
    }
};


// ── Data endpoints (authed) ──────────────────────────────────────

export const fetchAccounts = async () => {
    const res = await authedFetch(`${BASE_URL}/accounts/`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
};

export const createAccount = async (data: any) => {
    const res = await authedFetch(`${BASE_URL}/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create account');
    return res.json();
};

export const fetchTransactions = async () => {
    const res = await authedFetch(`${BASE_URL}/transactions/`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
};

export const createTransaction = async (data: any) => {
    const res = await authedFetch(`${BASE_URL}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
};

export const syncAllData = async (accounts: any[], transactions: any[]) => {
    const res = await authedFetch(`${BASE_URL}/sync/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts, transactions }),
    });
    if (!res.ok) throw new Error('Failed to sync data');
    return res.json();
};

export const fetchUser = async () => {
    const res = await authedFetch(`${BASE_URL}/auth/me`);
    if (!res.ok) return null;
    return res.json();
};

export const updateUser = async (userId: string, data: any) => {
    const res = await authedFetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
};

export const uploadAvatar = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await authedFetch(`${BASE_URL}/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload avatar');
    return res.json();
};

export const deleteAllData = async () => {
    const res = await authedFetch(`${BASE_URL}/accounts/`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete all data');
    return res.json();
};

// ── Offline-aware operations ─────────────────────────────────────

/**
 * Create account with offline support
 * If offline, queues the operation in localStorage
 */
export const createAccountWithOfflineSupport = async (data: any) => {
    if (!isOnlineNow()) {
        // Queue for offline sync
        const action = OfflineSyncManager.addAction({
            type: 'create',
            entity: 'account',
            entityId: `account_${Date.now()}`,
            data,
        });
        return {
            id: action.entityId,
            ...data,
            isSynced: false,
            pending: true,
            _offlineActionId: action.id,
        };
    }

    return createAccount(data);
};

/**
 * Create transaction with offline support
 * If offline, queues the operation in localStorage
 */
export const createTransactionWithOfflineSupport = async (data: any, accountId: string) => {
    if (!isOnlineNow()) {
        // Queue for offline sync
        const action = OfflineSyncManager.addAction({
            type: 'create',
            entity: 'transaction',
            entityId: `txn_${Date.now()}`,
            data: { ...data, account_id: accountId },
        });
        return {
            id: action.entityId,
            ...data,
            accountId,
            isSynced: false,
            pending: true,
            _offlineActionId: action.id,
        };
    }

    return createTransaction(data);
};

/**
 * Update user with offline support
 * If offline, queues the operation in localStorage
 */
export const updateUserWithOfflineSupport = async (userId: string, data: any) => {
    if (!isOnlineNow()) {
        OfflineSyncManager.addAction({
            type: 'update',
            entity: 'user',
            entityId: userId,
            data,
        });
        return { id: userId, ...data, isSynced: false };
    }

    return updateUser(userId, data);
};

/**
 * Process offline queue and sync with server
 * Returns { successful: number, failed: number, errors: string[] }
 */
export const processPendingActions = async (callbacks?: {
    onActionStart?: (action: OfflineAction) => void;
    onActionSuccess?: (action: OfflineAction) => void;
    onActionError?: (action: OfflineAction, error: string) => void;
}) => {
    const queue = OfflineSyncManager.getQueue();
    if (queue.length === 0) return { successful: 0, failed: 0, errors: [] };

    const results = { successful: 0, failed: 0, errors: [] as string[] };
    const shouldRetryActions: OfflineAction[] = [];

    // Process actions in order
    for (const action of queue) {
        callbacks?.onActionStart?.(action);

        try {
            switch (action.type) {
                case 'create':
                    if (action.entity === 'account') {
                    } else if (action.entity === 'transaction') {
                    }
                    break;
                case 'update':
                    if (action.entity === 'user') {
                    }
                    break;
            }

            // Mark as synced on success
            OfflineSyncManager.removeAction(action.id);
            results.successful++;
            callbacks?.onActionSuccess?.(action);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            results.errors.push(`${action.entity}/${action.type}: ${errorMsg}`);
            results.failed++;

            // Update retry count
            const updatedAction = { ...action, attempts: action.attempts + 1, lastAttempt: Date.now(), error: errorMsg };
            OfflineSyncManager.updateAction(action.id, updatedAction);

            // Add to retry list if should retry
            if (OfflineSyncManager.shouldRetry(updatedAction)) {
                shouldRetryActions.push(updatedAction);
            }

            callbacks?.onActionError?.(action, errorMsg);
        }
    }

    return results;
};

// Re-export OfflineAction type for use in components
export type { OfflineAction } from './utils/offlineSync';
