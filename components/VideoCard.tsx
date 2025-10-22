"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
  Film,
  Download,
  MoreVertical,
} from "lucide-react";
import type { Video } from "@/lib/services/videoService";
import { getRelativeTime } from "@/lib/services/videoService";
import { ShareDropdown } from "./ShareDropdown";

// Lazy load YouTubeUploadModal - only loaded when user clicks share
const YouTubeUploadModal = dynamic(
  () => import("./YouTubeUploadModal").then((mod) => ({ default: mod.YouTubeUploadModal })),
  { ssr: false }
);

import type { YouTubeVideoMetadata } from "./YouTubeUploadModal";

// Helper function to convert relative URLs to absolute URLs
const getAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // If already absolute URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Convert relative URL to absolute by prepending backend base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Remove /api/v1 suffix if present in API_BASE
  const baseUrl = API_BASE.replace(/\/api\/v1$/, '');

  // Ensure URL starts with /
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${path}`;
};

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
  const [showMenu, setShowMenu] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);

  const statusInfo = statusConfig[video.status];
  const StatusIcon = statusInfo.icon;

  // Convert URLs to absolute paths
  const posterUrl = getAbsoluteUrl(video.poster_url);
  const referenceImageUrl = getAbsoluteUrl(video.reference_image_url);
  const videoUrl = getAbsoluteUrl(video.video_url);

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

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering video modal
    if (!videoUrl) return;

    // Open video in new tab
    window.open(videoUrl, '_blank');
  };

  const handleYouTubeUpload = async (metadata: YouTubeVideoMetadata) => {
    // TODO: Implement actual YouTube upload API call
    // For now, simulate upload with a delay
    console.log('YouTube upload metadata:', metadata);
    console.log('Video URL:', videoUrl);

    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate success (90%) or failure (10%)
        if (Math.random() > 0.1) {
          console.log('YouTube upload successful!');
          resolve();
        } else {
          reject(new Error('Upload failed. Please check your YouTube connection.'));
        }
      }, 2000);
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-200"
      style={{ willChange: 'box-shadow' }}
    >
      {/* Thumbnail / Preview */}
      <div
        className="relative aspect-video bg-gray-100 group cursor-pointer"
        onClick={() => video.status === 'completed' && onPlay(video)}
        style={{ willChange: 'transform' }}
      >
        {video.status === 'completed' && videoUrl ? (
          <>
            {posterUrl && !imageError ? (
              // Priority 1: Use poster image if available
              <Image
                src={posterUrl}
                alt={video.prompt}
                fill
                className="object-contain bg-gray-50"
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                quality={85}
                style={{ transform: 'translateZ(0)' }}
              />
            ) : referenceImageUrl && !imageError ? (
              // Priority 2: Use reference image as fallback
              <Image
                src={referenceImageUrl}
                alt={video.prompt}
                fill
                className="object-contain bg-gray-50 opacity-60"
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                quality={85}
                style={{ transform: 'translateZ(0)' }}
              />
            ) : (
              // Priority 3: Use video first frame as thumbnail
              <video
                src={videoUrl}
                className="w-full h-full object-contain bg-gray-50"
                muted
                playsInline
                preload="metadata"
                style={{ transform: 'translateZ(0)' }}
                onError={() => {
                  // If video also fails, show placeholder
                  setImageError(true);
                }}
              >
                {/* Fallback if video fails to load */}
              </video>
            )}

            {/* Priority 4: Show placeholder only if everything fails */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                <Film className="w-16 h-16 text-purple-300" />
              </div>
            )}

            {/* Play Overlay - Show on hover - Optimized for performance */}
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-opacity duration-200 flex items-center justify-center"
              style={{ willChange: 'opacity' }}
            >
              <div
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
                style={{ willChange: 'opacity, transform' }}
              >
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

        {/* Three-dot menu button (top-right) */}
        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110"
            >
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />

                {/* Menu items */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {/* Download - Only for completed videos */}
                  {video.status === 'completed' && videoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        handleDownload(e);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}

                  {/* Share - Only for completed videos */}
                  {video.status === 'completed' && videoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowYouTubeModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      Share
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
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

        {/* Metadata and Play Button - Side by side layout */}
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Metadata and Status */}
          <div className="flex-1 space-y-2">
            {/* Metadata Tags */}
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

            {/* Timestamp with Status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">{getRelativeTime(video.created_at)}</span>
              <span className="text-gray-300">•</span>
              <span className={`flex items-center gap-1 ${statusInfo.iconColor}`}>
                <StatusIcon className={`w-3 h-3 ${statusInfo.animation}`} />
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Right side - Circular purple play button for completed videos */}
          {video.status === 'completed' && (
            <button
              onClick={() => onPlay(video)}
              className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
              title="Play video"
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {video.status === 'failed' && video.error_message && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {video.error_message}
          </div>
        )}

        {/* Retry Button - Only for failed videos */}
        {video.status === 'failed' && (
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* YouTube Upload Modal */}
      <YouTubeUploadModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        videoTitle={video.prompt}
        onUpload={handleYouTubeUpload}
      />
    </motion.div>
  );
};
