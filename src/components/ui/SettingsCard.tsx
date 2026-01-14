// components/ui/SettingsCard.tsx - Settings card wrapper for create room

import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SettingsCardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  style?: ViewStyle;
  helperText?: string;
}

export const SettingsCard = memo(function SettingsCard({
  title,
  icon,
  children,
  style,
  helperText,
}: SettingsCardProps) {
  return (
    <View style={[styles.container, style]}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
      
      {helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glass.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default SettingsCard;

