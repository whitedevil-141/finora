import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'finora_access_token';
const AUTH_USER_KEY = 'finora_auth_user';

// ── Token Management ──────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ── Auth Headers ──────────────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

// ── Fetch with Auth ───────────────────────────────────────
async function authedFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const headers = {
    ...await getAuthHeaders(),
    ...(opts.headers || {}),
  };
  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }

  return res;
}

// ── Auth Endpoints ────────────────────────────────────────
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

export async function authLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function authSignup(name: string, email: string, password: string): Promise<AuthResult> {
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
}

export async function authGetMe(): Promise<AuthResult['user'] | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await authedFetch(`${BASE_URL}/auth/me`);
    
    if (res.status === 401) {
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
    if ((error as any)?.status === 401) {
      throw error;
    }
    return null;
  }
}

// ── Data Endpoints ────────────────────────────────────────
export async function fetchAccounts() {
  const res = await authedFetch(`${BASE_URL}/accounts/`);
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
}

export async function createAccount(data: any) {
  const res = await authedFetch(`${BASE_URL}/accounts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create account');
  return res.json();
}

export async function fetchTransactions() {
  const res = await authedFetch(`${BASE_URL}/transactions/`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function createTransaction(data: any) {
  const res = await authedFetch(`${BASE_URL}/transactions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
}

export async function updateUser(userId: string, data: any) {
  const res = await authedFetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function deleteAllData() {
  const res = await authedFetch(`${BASE_URL}/accounts/`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete all data');
  return res.json();
}
