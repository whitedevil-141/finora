/**
 * Offline Sync Manager
 * Handles offline-first data persistence and cloud synchronization
 */

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'account' | 'transaction' | 'user';
  entityId: string;
  data: any;
  timestamp: number;
  attempts: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncState {
  isSyncing: boolean;
  lastSync: number | null;
  pendingCount: number;
  syncError: string | null;
}

const OFFLINE_QUEUE_KEY = 'finora_offline_queue';
const SYNC_STATE_KEY = 'finora_sync_state';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // Start with 1s, exponential backoff

export class OfflineSyncManager {
  static getQueue(): OfflineAction[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveQueue(queue: OfflineAction[]) {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  static getSyncState(): SyncState {
    try {
      const raw = localStorage.getItem(SYNC_STATE_KEY);
      return raw ? JSON.parse(raw) : { isSyncing: false, lastSync: null, pendingCount: 0, syncError: null };
    } catch {
      return { isSyncing: false, lastSync: null, pendingCount: 0, syncError: null };
    }
  }

  static saveSyncState(state: SyncState) {
    try {
      localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save sync state', e);
    }
  }

  static addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'attempts'>) {
    const queue = this.getQueue();
    const newAction: OfflineAction = {
      ...action,
      id: `${action.entityId}-${Date.now()}`,
      timestamp: Date.now(),
      attempts: 0,
    };
    queue.push(newAction);
    this.saveQueue(queue);
    
    // Update pending count
    const state = this.getSyncState();
    state.pendingCount = queue.length;
    this.saveSyncState(state);
    
    return newAction;
  }

  static updateAction(actionId: string, updates: Partial<OfflineAction>) {
    const queue = this.getQueue();
    const index = queue.findIndex(a => a.id === actionId);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      this.saveQueue(queue);
    }
  }

  static removeAction(actionId: string) {
    const queue = this.getQueue();
    const filtered = queue.filter(a => a.id !== actionId);
    this.saveQueue(filtered);
    
    // Update pending count
    const state = this.getSyncState();
    state.pendingCount = filtered.length;
    this.saveSyncState(state);
  }

  static clearQueue() {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      const state = this.getSyncState();
      state.pendingCount = 0;
      this.saveSyncState(state);
    } catch (e) {
      console.error('Failed to clear offline queue', e);
    }
  }

  static getRetryDelay(attemptCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, etc.
    return RETRY_DELAY_MS * Math.pow(2, Math.min(attemptCount, 3));
  }

  static shouldRetry(action: OfflineAction): boolean {
    return action.attempts < MAX_RETRY_ATTEMPTS;
  }

  static getPendingActionsCount(): number {
    return this.getQueue().length;
  }

  static getPendingActionsByEntity(entity: string): OfflineAction[] {
    return this.getQueue().filter(a => a.entity === entity);
  }

  static clearOldActions(olderThanMs: number = 7 * 24 * 60 * 60 * 1000) {
    const queue = this.getQueue();
    const now = Date.now();
    const filtered = queue.filter(a => (now - a.timestamp) < olderThanMs);
    this.saveQueue(filtered);
    
    const state = this.getSyncState();
    state.pendingCount = filtered.length;
    this.saveSyncState(state);
  }
}
