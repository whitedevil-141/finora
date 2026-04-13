import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface ScreenProps {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export default function Screen({ children, scroll = true, contentStyle }: PropsWithChildren<ScreenProps>) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={[styles.scrollContent, contentStyle]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, styles.page]} edges={['top', 'left', 'right']}>
      <View style={[styles.page, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
});
