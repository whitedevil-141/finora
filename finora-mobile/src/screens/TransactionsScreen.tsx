import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';
import { fetchTransactions } from '../api/client';

export default function TransactionsScreen() {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const txns = await fetchTransactions().catch(() => []);
      setTransactions(txns || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
                f === 'income' && filter === f && styles.filterTextIncome,
                f === 'expense' && filter === f && styles.filterTextExpense,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length > 0 ? (
        <SectionCard style={styles.transactionsCard}>
          {filtered.map((txn, idx) => (
            <View
              key={txn.id}
              style={[
                styles.transactionRow,
                idx < filtered.length - 1 && styles.transactionRowBorder,
              ]}
            >
              <View style={styles.txnLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    txn.type === 'income'
                      ? styles.categoryIconIncome
                      : styles.categoryIconExpense,
                  ]}
                >
                  <Text style={styles.categoryIconText}>
                    {txn.type === 'income' ? '📥' : '📤'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.transactionTitle}>{txn.title}</Text>
                  <Text style={styles.transactionCategory}>{txn.category}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  txn.type === 'income'
                    ? styles.incomeAmount
                    : styles.expenseAmount,
                ]}
              >
                {txn.type === 'income' ? '+' : '-'}৳{' '}
                {Math.abs(Number(txn.amount || 0)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
        </SectionCard>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No {filter} transactions yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextIncome: {
    color: '#10B981',
  },
  filterTextExpense: {
    color: '#EF4444',
  },
  transactionsCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  transactionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  categoryIconExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  categoryIconText: {
    fontSize: 20,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  transactionCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  incomeAmount: {
    color: colors.success,
  },
  expenseAmount: {
    color: colors.danger,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
