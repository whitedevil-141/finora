import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';
import { fetchAccounts, fetchTransactions } from '../api/client';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accs, txns] = await Promise.all([
        fetchAccounts().catch(() => []),
        fetchTransactions().catch(() => []),
      ]);
      setAccounts(accs || []);
      setTransactions((txns || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

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
        <Text style={styles.greeting}>Hi, {user?.name}! 👋</Text>
      </View>

      <SectionCard style={styles.balanceCard}>
        <Text style={styles.cardLabel}>Total Net Worth</Text>
        <Text style={styles.balance}>৳ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </SectionCard>

      {accounts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddAccount')}>
              <Text style={styles.addLink}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.accountsGrid}>
            {accounts.map((acc) => (
              <SectionCard
                key={acc.id}
                style={[
                  styles.accountCard,
                  acc.type === 'checking' && styles.accountCardChecking,
                  acc.type === 'savings' && styles.accountCardSavings,
                  acc.type === 'investment' && styles.accountCardInvestment,
                ]}
              >
                <Text style={styles.accountTypeLabel}>{acc.name}</Text>
                <Text style={styles.accountBalance}>
                  ৳ {Number(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </SectionCard>
            ))}
          </View>
        </View>
      )}

      {transactions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <SectionCard style={styles.transactionsCard}>
            {transactions.map((txn, idx) => (
              <View
                key={txn.id}
                style={[
                  styles.transactionRow,
                  idx < transactions.length - 1 && styles.transactionRowBorder,
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
        </View>
      )}

      <SectionCard>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Text style={styles.actionTextLight}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <Text style={styles.actionText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  balanceCard: {
    gap: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderWidth: 0,
  },
  cardLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
    fontWeight: '700',
  },
  balance: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 56,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  viewAllLink: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  accountsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  accountCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    minHeight: 140,
    borderWidth: 0,
    shadowOpacity: 0.08,
  },
  accountCardChecking: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  accountCardSavings: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountCardInvestment: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  accountTypeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  actionTextLight: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
  },
  actionTextLight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  activityMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  activityAmountPositive: {
    color: colors.success,
  },
});
