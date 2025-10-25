"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export type VideoStatusType = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

interface VideoStatusFilterProps {
  activeStatus: VideoStatusType;
  onStatusChange: (status: VideoStatusType) => void;
  counts?: {
    all: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export const VideoStatusFilter = ({
  activeStatus,
  onStatusChange,
  counts
}: VideoStatusFilterProps) => {
  const t = useTranslations('myVideos');

  const statusConfig = [
    { value: 'all' as const, label: t('statusAll'), color: 'text-gray-700' },
    { value: 'pending' as const, label: t('statusPending'), color: 'text-yellow-600' },
    { value: 'processing' as const, label: t('statusProcessing'), color: 'text-purple-600' },
    { value: 'completed' as const, label: t('statusCompleted'), color: 'text-green-600' },
    { value: 'failed' as const, label: t('statusFailed'), color: 'text-red-600' },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {statusConfig.map((status) => {
        const isActive = activeStatus === status.value;
        const count = counts?.[status.value] || 0;

        return (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
              transition-all duration-200
              ${isActive
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {status.label}
              {counts && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </span>

            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-purple-600 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
