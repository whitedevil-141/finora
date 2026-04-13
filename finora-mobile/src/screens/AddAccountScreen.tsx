import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';

export default function AddAccountScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Add Account</Text>
        <Text style={styles.subtitle}>Track a new asset or wallet</Text>
      </View>

      <SectionCard>
        <Text style={styles.label}>Account Name</Text>
        <TextInput placeholder="Main Bank" style={styles.input} placeholderTextColor={colors.textMuted} />

        <Text style={[styles.label, styles.labelSpacing]}>Initial Balance</Text>
        <TextInput placeholder="0" keyboardType="numeric" style={styles.input} placeholderTextColor={colors.textMuted} />

        <Text style={[styles.label, styles.labelSpacing]}>Account Type</Text>
        <TextInput placeholder="Checking" style={styles.input} placeholderTextColor={colors.textMuted} />

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
    fontWeight: '700',
  },
  labelSpacing: {
    marginTop: 12,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
