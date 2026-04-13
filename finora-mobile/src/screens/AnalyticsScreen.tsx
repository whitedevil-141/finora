import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';
import { fetchAccounts, fetchTransactions } from '../api/client';

export default function AnalyticsScreen() {
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
      setTransactions(txns || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const totalExp = Math.abs(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((a, c) => a + Number(c.amount || 0), 0)
  );
  const totalInc = transactions
    .filter(t => t.type === 'income')
    .reduce((a, c) => a + Number(c.amount || 0), 0);
  const net = totalInc - totalExp;

  // Group expenses by category
  const expByCategory: Record<string, number> = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Math.abs(Number(curr.amount || 0));
      return acc;
    }, {});

  const topExpenses = Object.entries(expByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxExpense = topExpenses[0]?.[1] || 1;

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
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your cash flow trends</Text>
      </View>

      <View style={styles.metricsGrid}>
        <SectionCard style={[styles.metricCard, styles.netFlowCard]}>
          <Text style={styles.metricLabel}>Net Flow</Text>
          <Text style={[styles.metricValue, net >= 0 ? styles.netPositive : styles.netNegative]}>
            {net >= 0 ? '+' : '-'}৳ {Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </SectionCard>

        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Income</Text>
          <Text style={[styles.metricValue, styles.incomeColor]}>
            ৳ {totalInc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </SectionCard>

        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Expense</Text>
          <Text style={[styles.metricValue, styles.expenseColor]}>
            ৳ {totalExp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </SectionCard>
      </View>

      {topExpenses.length > 0 && (
        <SectionCard style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Top Expenses</Text>
          {topExpenses.map(([category, amount]) => {
            const percentage = (amount / maxExpense) * 100;
            return (
              <View key={category} style={styles.categoryAnalytic}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>
                    ৳ {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </SectionCard>
      )}

      {accounts.length > 0 && (
        <SectionCard style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Asset Distribution</Text>
          {accounts.map((acc) => {
            const percentage = totalBalance > 0 ? (Number(acc.balance || 0) / totalBalance) * 100 : 0;
            return (
              <View key={acc.id} style={styles.categoryAnalytic}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{acc.name}</Text>
                  <Text style={styles.categoryAmount}>
                    ৳ {Number(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFillAsset,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </SectionCard>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  netFlowCard: {
    backgroundColor: '#1F2937',
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  netFlowCard: {
    backgroundColor: '#1F2937',
  },
  netFlowCard: {
    backgroundColor: '#1F2937',
  },
  netPositive: {
    color: colors.success,
  },
  netNegative: {
    color: colors.danger,
  },
  incomeColor: {
    color: colors.success,
  },
  expenseColor: {
    color: colors.danger,
  },
  analyticsSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoryAnalytic: {
    gap: 8,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressFillAsset: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
});
