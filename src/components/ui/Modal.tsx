// components/ui/Modal.tsx - Reusable modal component

import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  size = 'md',
  position = 'center',
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <View
          className={`
            flex-1 bg-black/50
            ${position === 'center' ? 'justify-center' : 'justify-end'}
            items-center px-4
          `}
        >
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className={`w-full ${sizeStyles[size]}`}
            >
              <View
                className={`
                  bg-white
                  ${position === 'center' ? 'rounded-2xl' : 'rounded-t-3xl'}
                  overflow-hidden
                `}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900">
                      {title || ''}
                    </Text>
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
                      >
                        <Text className="text-gray-500 text-lg">✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <ScrollView
                  className="px-5 py-4"
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

export default Modal;

