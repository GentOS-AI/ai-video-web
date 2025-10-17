"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, type ToastType } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface NotificationContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Toast state
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToastState, setShowToastState] = useState(false);

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const showToast = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToastState(true);
  };

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmConfig(options);
    setShowConfirmDialog(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    // Clear config after animation completes
    setTimeout(() => setConfirmConfig(null), 300);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Global Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToastState}
        onClose={() => setShowToastState(false)}
      />

      {/* Global Confirm Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          confirmVariant={confirmConfig.confirmVariant}
          onConfirm={confirmConfig.onConfirm}
          onCancel={handleConfirmClose}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within NotificationProvider"
    );
  }
  return context;
}
