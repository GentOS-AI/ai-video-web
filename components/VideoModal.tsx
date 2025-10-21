"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Video } from "@/lib/services/videoService";

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ video, isOpen, onClose }: VideoModalProps) => {
  const [aspectRatio, setAspectRatio] = useState<'video' | 'portrait' | 'square'>('video');

  // Detect video aspect ratio
  useEffect(() => {
    if (!isOpen || !video?.video_url) return;

    const videoElement = document.createElement('video');
    const videoUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${video.video_url}`;
    videoElement.src = videoUrl;

    const handleLoadedMetadata = () => {
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      const ratio = width / height;

      console.log('Video dimensions:', { width, height, ratio });

      if (ratio > 1.5) {
        // Wide video (landscape)
        setAspectRatio('video');
      } else if (ratio < 0.75) {
        // Tall video (portrait)
        setAspectRatio('portrait');
      } else {
        // Square-ish video
        setAspectRatio('square');
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isOpen, video]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop - Semi-transparent gray overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container - Minimalist video-only design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full ${
              aspectRatio === 'portrait'
                ? 'max-w-lg'
                : aspectRatio === 'square'
                ? 'max-w-2xl'
                : 'max-w-6xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Floating top-right */}
            <button
              onClick={onClose}
              className="absolute -top-8 right-0 sm:-top-10 sm:-right-10 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 group z-10"
              aria-label="Close video"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Video Player - Clean, borderless design with dynamic aspect ratio */}
            {videoUrl && (
              <div className="bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex items-center justify-center">
                <video
                  src={videoUrl}
                  poster={video.poster_url || undefined}
                  controls
                  autoPlay
                  className="max-h-[90vh] max-w-full w-auto h-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
