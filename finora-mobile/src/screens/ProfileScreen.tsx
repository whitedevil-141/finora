import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';
import { deleteAllData } from '../api/client';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const displayName = (user?.name || user?.email || 'User').trim();
  const avatarInitial = displayName ? displayName[0].toUpperCase() : 'U';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your accounts and transactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteAllData();
              await refreshUser();
              Alert.alert('Success', 'All data has been deleted.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete data');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <SectionCard style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayName || 'User'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
          </View>
        </View>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Name</Text>
          </TouchableOpacity>
        )}
        {isEditing && (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="New name"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editActionBtn, styles.saveBtnStyle]}
                onPress={async () => {
                  try {
                    setIsLoading(true);
                    await refreshUser();
                    setIsEditing(false);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionBtn, styles.cancelBtnStyle]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedName(user?.name || '');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionLabel}>Account Info</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user?.email || ''}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Provider</Text>
          <Text style={styles.rowValue}>{(user?.provider || 'email').charAt(0).toUpperCase() + (user?.provider || 'email').slice(1)}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Theme</Text>
          <Text style={styles.rowValue}>Device Default</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Currency</Text>
          <Text style={styles.rowValue}>BDT (৳)</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoading}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAllData}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete All Data</Text>
          )}
        </TouchableOpacity>
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
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  profileCard: {
    gap: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMuted,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnStyle: {
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtnStyle: {
    backgroundColor: colors.surfaceMuted,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
