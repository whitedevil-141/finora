import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { login, signup, isLoading, authError } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await signup(name, email, password);
    } catch (err) {
      Alert.alert('Signup Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>Finora</Text>
          <Text style={styles.subtitle}>Personal Finance Tracker</Text>
        </View>

        <View style={styles.form}>
          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {authError && <Text style={styles.errorText}>{authError}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isSignup ? handleSignup : handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textLight} size="small" />
            ) : (
              <Text style={styles.buttonText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignup(!isSignup)} disabled={isLoading}>
            <Text style={styles.toggleText}>
              {isSignup
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Demo Credentials:</Text>
          <Text style={styles.footerEmail}>demo@finora.app</Text>
          <Text style={styles.footerPassword}>password123</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  form: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: 16,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  footerEmail: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  footerPassword: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
