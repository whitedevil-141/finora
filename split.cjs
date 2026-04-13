const fs = require('fs');
const path = require('path');

const fileContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
const lines = fileContent.split('\n');

const sliceLines = (start, end) => lines.slice(start - 1, end).join('\n');

const mkdir = (dir) => {
    const fullPath = path.join(__dirname, 'src', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
};

mkdir('constants');
mkdir('components');
mkdir('views');
mkdir('types');

// Imports logic
const importsShared = `import { ElementType } from 'react';\nimport { Wallet, CloudOff, CheckCircle2, RefreshCw, ChevronRight, LayoutGrid } from 'lucide-react';\n`;
const importsViews = `import { useState, useMemo } from 'react';\nimport { Plus, Landmark, Wallet, CloudOff, Search, PieChart, Check, Camera, Settings, Bell, Shield, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';\nimport { FormatCurrency, CategoryIcon, SyncIndicator, Toggle, SettingsRow } from '../components/Shared';\nimport { IconMap, CATEGORIZED_SUGGESTIONS } from '../constants';\n`;

// 1. types/index.ts
fs.writeFileSync('src/types/index.ts', `export type TxnRecord = { id: number; type: string; amount: number; category: string; title: string; date: string; accountId: number; isSynced: boolean; pending?: boolean; };\nexport type AccRecord = { id: number; name: string; balance: number; type: string; isSynced: boolean; };\n`);

// 2. constants/index.tsx
const constantsContent = `import { Home, List, PieChart, Settings, Coffee, AlertCircle, ShoppingBag, ArrowUpRight, RefreshCw, Wallet, Car, Smartphone, Zap, Heart, Gift, Book, Briefcase, Plane, Tags, LayoutGrid, TrendingUp, TrendingDown, Activity, Utensils, Receipt, Monitor, Dumbbell, Stethoscope } from 'lucide-react';\n\n` + sliceLines(16, 77);
fs.writeFileSync('src/constants/index.tsx', constantsContent);

// 3. components/Shared.tsx
const sharedContent = importsShared + `import { IconMap } from '../constants';\n\n` + sliceLines(81, 136);
fs.writeFileSync('src/components/Shared.tsx', sharedContent);

// 4. views/DashboardView.tsx
fs.writeFileSync('src/views/DashboardView.tsx', importsViews + `\n` + sliceLines(140, 188) + `\nexport default DashboardView;`);

// 5. views/TransactionsView.tsx
fs.writeFileSync('src/views/TransactionsView.tsx', importsViews + `\n` + sliceLines(190, 217) + `\nexport default TransactionsView;`);

// 6. views/AddTransactionView.tsx
fs.writeFileSync('src/views/AddTransactionView.tsx', importsViews + `\n` + sliceLines(219, 388) + `\nexport default AddTransactionView;`);

// 7. views/AnalyticsView.tsx
fs.writeFileSync('src/views/AnalyticsView.tsx', importsViews + `import { TxnRecord, AccRecord } from '../types';\n` + sliceLines(392, 419) + `\nexport default AnalyticsView;`);

// 8. views/ProfileView.tsx
fs.writeFileSync('src/views/ProfileView.tsx', importsViews + `\n` + sliceLines(421, 441) + `\nexport default ProfileView;`);

const importsApp = `import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Check, AlertCircle, Moon, Sun, Wallet, Landmark, PieChart, ArrowLeft } from 'lucide-react';
import { flushSync } from 'react-dom';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, NAV_ITEMS_MAP, HARDCODED_CATEGORIES } from './constants';
import { SyncIndicator } from './components/Shared';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import AddTransactionView from './views/AddTransactionView';
import AnalyticsView from './views/AnalyticsView';
import ProfileView from './views/ProfileView';
`;

// Update App.tsx
const appContent = importsApp + '\n' + sliceLines(445, 650);
fs.writeFileSync('src/App.tsx', appContent);

console.log('Successfully structured directory!');
