"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        confirmVariant === "danger"
                          ? "bg-red-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          confirmVariant === "danger"
                            ? "text-red-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h3>
                  </div>
                  <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-gray-600 leading-relaxed">{message}</p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  className="min-w-[100px]"
                >
                  {cancelText}
                </Button>
                <Button
                  variant={confirmVariant === "danger" ? "primary" : "primary"}
                  size="md"
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`min-w-[100px] ${
                    confirmVariant === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
