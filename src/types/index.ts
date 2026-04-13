export type TxnRecord = { id: number; type: string; amount: number; category: string; title: string; date: string; accountId: number; isSynced: boolean; pending?: boolean; };
export type AccRecord = { id: number; name: string; balance: number; type: string; isSynced: boolean; };
