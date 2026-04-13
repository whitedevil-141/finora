# Finora Offline-First Architecture

## Overview

Finora implements a comprehensive offline-first system that allows users to work seamlessly whether they have internet connection or not. All data operations are queued locally and synced to the server when online.

## Key Features

### 1. Online Detection
- Real-time monitoring of network status via `navigator.onLine`
- Automatic sync triggers when connection is established
- `isOnline` state in App.tsx controls behavior

### 2. Local Data Persistence
- **Accounts & Transactions**: Cached in localStorage with user ID
  - `finora_accounts_cache_{userId}`
  - `finora_transactions_cache_{userId}`
- **Auth Token**: Stored in `finora_access_token`
- **Offline Queue**: Stored in `finora_offline_queue`
- **Sync State**: Stored in `finora_sync_state`

### 3. Offline Operation Queue

Uses `OfflineSyncManager` to manage pending operations:

```typescript
interface OfflineAction {
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
```

#### Queue Management
- **Add Action**: `OfflineSyncManager.addAction(...)`
- **Get Queue**: `OfflineSyncManager.getQueue()`
- **Remove Action**: `OfflineSyncManager.removeAction(actionId)`
- **Clear Queue**: `OfflineSyncManager.clearQueue()`
- **Get Pending Count**: `OfflineSyncManager.getPendingActionsCount()`

### 4. Offline-Aware API Operations

#### Before (Direct API Call)
```typescript
await createTransaction(data);
```

#### After (Offline-Aware)
```typescript
await createTransactionWithOfflineSupport(data, accountId);
```

**Automatic Behavior:**
- If **online**: Calls API directly, returns server response
- If **offline**: Queues operation locally, returns temp object with `isSynced: false` and `pending: true`

### 5. Automatic Sync Process

#### Triggered When:
1. App detects connection (via `online` event)
2. User navigates back online
3. On app startup if online

#### Sync Flow:
```
Check pending actions → Process each action → Update local cache → Show status
```

#### Error Handling:
- **Retry Logic**: Up to 3 attempts with exponential backoff
- **Error Logging**: Each failed action can log error for debugging
- **User Feedback**: Toast notifications for sync success/failure

### 6. UI Status Indicators

#### Offline Banner
```
⚠️ Offline mode: Changes saved locally and will sync when online.
```
- Shows when `isOnline === false`
- Informs user that operations are queued

#### Syncing Banner
```
⏳ Syncing changes with cloud...
```
- Shows when `isSyncing === true`
- Indicates active sync in progress

#### Pending Changes Banner
```
✓ 3 pending changes ready to sync
```
- Shows when offline queue has items and user is online
- Indicates wait pending items in queue

## Implementation Details

### Data Structure

**Account with Offline Info:**
```typescript
{
  id: "temp-1712000000000",     // Temp ID while offline
  name: "My Bank",
  balance: 1000,
  type: "checking",
  isSynced: false,              // Not yet synced
  pending: true,                // Awaiting sync
  _offlineActionId: "..."       // Link to queue item
}
```

**Transaction with Offline Info:**
```typescript
{
  id: "txn_1712000000000",       // Temp ID while offline
  accountId: "temp-1712000000000",
  amount: -500,
  category: "Food",
  title: "Ristorante",
  date: "2024-04-13T10:30:00Z",
  type: "expense",
  isSynced: false,              // Not yet synced
  pending: true,                // Awaiting sync
}
```

### Sync Manager Storage

**Offline Queue Entry:**
```json
{
  "id": "account_1712000000000-1712000000100",
  "type": "create",
  "entity": "account",
  "entityId": "temp-1712000000000",
  "timestamp": 1712000000100,
  "attempts": 0,
  "data": {
    "name": "My Bank",
    "balance": 1000,
    "type": "checking"
  }
}
```

## Usage Examples

### Creating Data Offline

```typescript
// Accounts
const newAccount = await createAccountWithOfflineSupport({
  name: "My Savings",
  balance: 5000,
  type: "savings"
});

// Transactions
const newTxn = await createTransactionWithOfflineSupport(
  {
    account_id: accountId,
    amount: 500,
    category: "Groceries",
    title: "Grocery Store",
    type: "expense"
  },
  accountId
);

// User updates
await updateUserWithOfflineSupport(userId, {
  name: "John Doe"
});
```

### Monitoring Sync Status

```typescript
// Get pending items
const pendingCount = OfflineSyncManager.getPendingActionsCount();

// Get specific pending actions
const pendingTransactions = OfflineSyncManager.getPendingActionsByEntity('transaction');

// Get sync state with timestamps
const syncState = OfflineSyncManager.getSyncState();
// { isSyncing, lastSync, pendingCount, syncError }
```

### Manual Sync Trigger

```typescript
const result = await processPendingActions({
  onActionStart: (action) => console.log('Syncing:', action),
  onActionSuccess: (action) => console.log('Synced:', action),
  onActionError: (action, error) => console.log('Failed:', error),
});

console.log(`Synced ${result.successful}, Failed: ${result.failed}`);
```

## Conflict Resolution

**Current Strategy: Last-Write-Wins**

1. Local changes are timestamped
2. Server always accepts newer data
3. If server has newer data, local changes are discarded
4. User is notified of conflicts via toast

**Future Enhancement:**
- Merge strategies for specific entities
- 3-way merge for transaction lists
- User choice for conflicts

## Data Consistency

### Account Balance Consistency
- Balance is updated optimistically when offline
- When syncing, transactions are replayed from server state
- Prevents double-counting of operations

### Transaction Ordering
- Transactions maintain creation timestamp
- Server deduplicates by timestamp + accountId + amount
- Prevents duplicate syncs on retry

## Storage Limits

**localStorage Quota:**
- Most browsers: 5-10MB per domain
- Current usage: ~1KB per 100 transactions
- Estimated capacity: 500k+ transactions per domain

**Cache Cleanup:**
- Old offline actions (7+ days) are auto-purged
- See: `OfflineSyncManager.clearOldActions()`

## Debugging

### Check Sync State
```typescript
// Console
localStorage.getItem('finora_sync_state')
localStorage.getItem('finora_offline_queue')
OfflineSyncManager.getQueue()
```

### Monitor Network Activity
```typescript
// Network tab in DevTools
// All API calls show retry attempts
// Failed requests are queued with error messages
```

### Reset Offline State
```typescript
// Clear all offline data
OfflineSyncManager.clearQueue();
localStorage.removeItem('finora_sync_state');

// Refresh app
location.reload();
```

## Best Practices

1. **Always Use Offline-Aware Functions**
   - `createAccountWithOfflineSupport()` instead of `createAccount()`
   - `createTransactionWithOfflineSupport()` instead of `createTransaction()`

2. **Check Online Status Before Critical Operations**
   ```typescript
   if (!isOnline) {
     showWarning("Internet required for this operation");
     return;
   }
   ```

3. **Handle Optimistic Updates**
   - Update UI immediately while syncing
   - Show visual indicator that data is pending

4. **Provide User Feedback**
   - Show toast for offline status
   - Show toast when sync completes
   - Show pending count in UI

5. **Test Offline Flow**
   - Disable network in DevTools
   - Create transactions
   - Re-enable network
   - Verify sync completes

## Performance Considerations

- **Batch Sync**: All pending actions sync together
- **Exponential Backoff**: Avoids server overload on retries
- **Optimistic UI**: Instant visual feedback while syncing
- **Cache First**: Uses local data before fetching

## Known Limitations

1. **Avatar Upload**: Not queued (file uploads need network)
2. **User Sync**: Only name updates are queued
3. **No Encryption**: Local data is plain localStorage
4. **Single Device**: No cross-device sync

## Future Enhancements

- [ ] IndexedDB for larger storage capacity
- [ ] Service Worker for background sync
- [ ] WebSocket for real-time sync
- [ ] Encryption for sensitive data
- [ ] Conflict resolution UI
- [ ] Offline analytics
- [ ] Delta sync (only changed fields)
