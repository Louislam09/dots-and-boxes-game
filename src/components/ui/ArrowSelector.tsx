// components/ui/ArrowSelector.tsx - Reusable arrow selector component

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

interface ArrowSelectorProps<T> {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  renderValue?: (value: T) => string;
  label?: string;
  subtitle?: string;
}

export const ArrowSelector = memo(function ArrowSelector<T>({
  value,
  options,
  onChange,
  renderValue,
  label,
  subtitle,
}: ArrowSelectorProps<T>) {
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  const currentIndex = options.indexOf(value);

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
    onChange(options[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
    onChange(options[newIndex]);
  };

  const handleLeftPressIn = () => {
    leftScale.value = withSpring(0.85, { damping: 15 });
  };

  const handleLeftPressOut = () => {
    leftScale.value = withSpring(1, { damping: 15 });
  };

  const handleRightPressIn = () => {
    rightScale.value = withSpring(0.85, { damping: 15 });
  };

  const handleRightPressOut = () => {
    rightScale.value = withSpring(1, { damping: 15 });
  };

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  const displayValue = renderValue ? renderValue(value) : String(value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.selectorRow}>
        <TouchableOpacity
          onPress={handlePrev}
          onPressIn={handleLeftPressIn}
          onPressOut={handleLeftPressOut}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.arrowButton, leftAnimatedStyle]}>
            <Text style={styles.arrowText}>◀</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{displayValue}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          onPressIn={handleRightPressIn}
          onPressOut={handleRightPressOut}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.arrowButton, rightAnimatedStyle]}>
            <Text style={styles.arrowText}>▶</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}) as <T>(props: ArrowSelectorProps<T>) => React.ReactElement;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.glass.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: COLORS.accent.primary,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  subtitleText: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 4,
  },
});

export default ArrowSelector;

