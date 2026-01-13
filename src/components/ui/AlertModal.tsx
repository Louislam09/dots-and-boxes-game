// components/ui/AlertModal.tsx - Custom alert modal

import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';

export type AlertType = 'info' | 'error' | 'success' | 'warning';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
};

interface AlertModalProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
}

const getTypeStyles = (type: AlertType) => {
    switch (type) {
        case 'error':
            return {
                icon: '✕',
                iconColor: COLORS.status.error,
                iconBg: 'rgba(244, 63, 94, 0.15)',
                titleColor: COLORS.status.error,
            };
        case 'success':
            return {
                icon: '✓',
                iconColor: COLORS.status.success,
                iconBg: 'rgba(16, 185, 129, 0.15)',
                titleColor: COLORS.status.success,
            };
        case 'warning':
            return {
                icon: '⚠',
                iconColor: COLORS.status.warning,
                iconBg: 'rgba(245, 158, 11, 0.15)',
                titleColor: COLORS.status.warning,
            };
        default: // info
            return {
                icon: 'ℹ',
                iconColor: COLORS.accent.primary,
                iconBg: 'rgba(0, 217, 255, 0.15)',
                titleColor: COLORS.accent.primary,
            };
    }
};

export function AlertModal({
    visible,
    title,
    message,
    type = 'info',
    buttons = [{ text: 'OK' }],
    cancelable = true,
    onDismiss,
}: AlertModalProps) {
    const typeStyles = getTypeStyles(type);

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const handleBackdropPress = () => {
        if (cancelable && onDismiss) {
            onDismiss();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={cancelable ? onDismiss : undefined}
        >
            <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
                <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
                    {/* Icon */}
                    <View style={styles.iconWrapper}>
                        <View style={[styles.iconBg, { backgroundColor: typeStyles.iconBg }]}>
                            <Text style={[styles.icon, { color: typeStyles.iconColor }]}>
                                {typeStyles.icon}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: typeStyles.titleColor }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                        {buttons.map((button, index) => {
                            const isCancel = button.style === 'cancel';
                            const isDestructive = button.style === 'destructive';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleButtonPress(button)}
                                    style={[
                                        styles.button,
                                        isCancel && styles.buttonCancel,
                                        isDestructive && styles.buttonDestructive,
                                        !isCancel && !isDestructive && styles.buttonDefault,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isCancel && styles.buttonTextCancel,
                                            (isDestructive || !isCancel) && styles.buttonTextLight,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 24,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        backgroundColor: COLORS.background.secondary,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.glass.border,
    },
    iconWrapper: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 28,
        fontWeight: '700',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonsContainer: {
        gap: 10,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonDefault: {
        backgroundColor: COLORS.accent.primary,
    },
    buttonCancel: {
        backgroundColor: COLORS.glass.background,
        borderWidth: 1,
        borderColor: COLORS.glass.border,
    },
    buttonDestructive: {
        backgroundColor: COLORS.status.error,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextLight: {
        color: COLORS.background.primary,
    },
    buttonTextCancel: {
        color: COLORS.text.primary,
    },
});

export default AlertModal;

