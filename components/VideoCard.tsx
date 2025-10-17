"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Trash2,
  RotateCcw,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Film
} from "lucide-react";
import type { Video } from "@/lib/services/videoService";
import { getRelativeTime } from "@/lib/services/videoService";

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onDelete: (id: number) => void;
  onRetry: (id: number) => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-600',
    animation: 'animate-pulse'
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Loader2,
    iconColor: 'text-purple-600',
    animation: 'animate-spin'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    animation: ''
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
    animation: ''
  }
};

export const VideoCard = ({ video, onPlay, onDelete, onRetry }: VideoCardProps) => {
  const [imageError, setImageError] = useState(false);

  const statusInfo = statusConfig[video.status];
  const StatusIcon = statusInfo.icon;

  const handleDelete = () => {
    // Delegate to parent component which will show confirm dialog
    onDelete(video.id);
  };

  const handleRetry = async () => {
    try {
      await onRetry(video.id);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video bg-gray-100 group cursor-pointer" onClick={() => video.status === 'completed' && onPlay(video)}>
        {video.status === 'completed' && video.video_url ? (
          <>
            {video.poster_url && !imageError ? (
              <Image
                src={video.poster_url}
                alt={video.prompt}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : video.reference_image_url && !imageError ? (
              <Image
                src={video.reference_image_url}
                alt={video.prompt}
                fill
                className="object-cover opacity-60"
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                <Film className="w-16 h-16 text-purple-300" />
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Play className="w-8 h-8 text-purple-600 ml-1" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
            <StatusIcon className={`w-16 h-16 ${statusInfo.iconColor} ${statusInfo.animation}`} />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full text-xs font-semibold border
            ${statusInfo.color}
            backdrop-blur-sm shadow-sm
          `}>
            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.animation}`} />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Prompt */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {video.prompt}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
            {video.model}
          </span>
          {video.duration && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              {video.duration}s
            </span>
          )}
          {video.resolution && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              {video.resolution}
            </span>
          )}
        </div>

        {/* Error Message */}
        {video.status === 'failed' && video.error_message && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {video.error_message}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {getRelativeTime(video.created_at)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {/* Play Button - Always visible, disabled for non-completed status */}
          <button
            onClick={() => video.status === 'completed' && onPlay(video)}
            disabled={video.status !== 'completed'}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${video.status === 'completed'
                ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Play className="w-4 h-4" />
            Play
          </button>

          {/* Retry Button - Only for failed videos */}
          {video.status === 'failed' && (
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          )}

          {/* Delete Button - Always visible */}
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};
