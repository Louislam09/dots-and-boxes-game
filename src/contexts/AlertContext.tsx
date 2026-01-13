// contexts/AlertContext.tsx - Alert context for custom alerts

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react';
import { AlertModal, AlertOptions, AlertButton } from '../components/ui/AlertModal';

interface AlertContextType {
  alert: (options: AlertOptions) => void;
  alertInfo: (title: string, message?: string) => void;
  alertError: (title: string, message?: string) => void;
  alertSuccess: (title: string, message?: string) => void;
  alertWarning: (title: string, message?: string) => void;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  actionSheet: (
    title: string,
    message: string,
    options: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    cancelable: true,
  });

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      ...options,
      visible: true,
      buttons: options.buttons || [{ text: 'OK' }],
      type: options.type || 'info',
      cancelable: options.cancelable !== false,
    });
  }, []);

  const alert = useCallback(
    (options: AlertOptions) => {
      showAlert(options);
    },
    [showAlert]
  );

  const alertInfo = useCallback(
    (title: string, message?: string) => {
      showAlert({ title, message, type: 'info' });
    },
    [showAlert]
  );

  const alertError = useCallback(
    (title: string, message?: string) => {
      showAlert({ title, message, type: 'error' });
    },
    [showAlert]
  );

  const alertSuccess = useCallback(
    (title: string, message?: string) => {
      showAlert({ title, message, type: 'success' });
    },
    [showAlert]
  );

  const alertWarning = useCallback(
    (title: string, message?: string) => {
      showAlert({ title, message, type: 'warning' });
    },
    [showAlert]
  );

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      showAlert({
        title,
        message,
        type: 'warning',
        cancelable: false,
        buttons: [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: 'Confirm',
            style: 'default',
            onPress: onConfirm,
          },
        ],
      });
    },
    [showAlert]
  );

  const actionSheet = useCallback(
    (
      title: string,
      message: string,
      options: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
      }>
    ) => {
      const buttons: AlertButton[] = options.map((opt) => ({
        text: opt.text,
        onPress: opt.onPress,
        style: opt.style || 'default',
      }));

      showAlert({
        title,
        message,
        type: 'info',
        buttons,
        cancelable: true,
      });
    },
    [showAlert]
  );

  return (
    <AlertContext.Provider
      value={{
        alert,
        alertInfo,
        alertError,
        alertSuccess,
        alertWarning,
        confirm,
        actionSheet,
      }}
    >
      {children}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttons={alertState.buttons}
        cancelable={alertState.cancelable}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

export default AlertContext;

