"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Calendar, Film } from "lucide-react";
import type { Video } from "@/lib/services/videoService";
import { VideoPlayer } from "./VideoPlayer";

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ video, isOpen, onClose }: VideoModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!video) return null;

  const videoUrl = video.video_url
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${video.video_url}`
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Video Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID: {video.id}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Video Player */}
              {videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <VideoPlayer
                    src={videoUrl}
                    poster={video.poster_url || undefined}
                    autoPlay={true}
                  />
                </div>
              )}

              {/* Video Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Prompt
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {video.prompt}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Technical Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Model:</span>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
                          {video.model}
                        </span>
                      </div>
                      {video.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {video.duration} seconds
                          </span>
                        </div>
                      )}
                      {video.resolution && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Resolution:</span>
                          <span className="font-medium text-gray-900">
                            {video.resolution}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {new Date(video.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {videoUrl && (
                  <a
                    href={videoUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Video
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
