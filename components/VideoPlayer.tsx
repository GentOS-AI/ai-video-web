"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Maximize2, X } from "lucide-react";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  onPlayStateChange?: (isPlaying: boolean) => void;
  onOrientationChange?: (width: number, height: number) => void; // Callback for video dimension changes
  children?: React.ReactNode;
  playDelay?: number; // Delay in ms before playing (for staggered playback)
  enableViewportDetection?: boolean; // Enable Intersection Observer
  objectFit?: "cover" | "contain"; // Control how video fills the container
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = "",
  autoPlay = false,
  muted = true,
  preload = "metadata",
  onPlayStateChange,
  onOrientationChange,
  children,
  playDelay = 0,
  enableViewportDetection = false,
  objectFit = "cover", // Default to cover for backward compatibility
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false); // Track if user manually paused
  const [isPortrait, setIsPortrait] = useState(false); // Track if video is portrait
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const [aspectRatio, setAspectRatio] = useState<'video' | 'portrait' | 'square'>('video');
  const [wasPlayingBeforeFullscreen, setWasPlayingBeforeFullscreen] = useState(false); // Track play state before fullscreen
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use Intersection Observer to detect if video is in viewport
  const isInViewport = useIntersectionObserver(containerRef, {
    threshold: 0.5, // 50% visible
  });

  // Detect if video is portrait (height > width) and aspect ratio
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const ratio = width / height;
      const isVideoPortrait = height > width;

      setIsPortrait(isVideoPortrait);

      // Determine aspect ratio category for fullscreen display
      if (ratio > 1.5) {
        setAspectRatio('video'); // Wide video (landscape)
      } else if (ratio < 0.75) {
        setAspectRatio('portrait'); // Tall video (portrait)
      } else {
        setAspectRatio('square'); // Square-ish video
      }

      // Notify parent component of video dimensions
      if (onOrientationChange) {
        onOrientationChange(width, height);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Check immediately if metadata is already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [src, onOrientationChange]);

  // Handle autoplay with delay and viewport detection
  useEffect(() => {
    // Don't autoplay if user has manually interacted (paused)
    if (!autoPlay || !videoRef.current || userInteracted) return;

    const shouldPlay = enableViewportDetection ? isInViewport : true;

    if (shouldPlay) {
      // Clear any existing timeout
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }

      // Play with delay (for staggered playback)
      playTimeoutRef.current = setTimeout(() => {
        videoRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          // Autoplay was prevented by browser
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }, playDelay);
    } else if (enableViewportDetection && !isInViewport && isPlaying) {
      // Pause when out of viewport
      videoRef.current?.pause();
      setIsPlaying(false);
    }

    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, [autoPlay, isInViewport, enableViewportDetection, playDelay, isPlaying, userInteracted]);

  const togglePlay = () => {
    if (videoRef.current) {
      // Mark that user has manually interacted
      setUserInteracted(true);

      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openFullscreen = () => {
    // Save current play state
    setWasPlayingBeforeFullscreen(isPlaying);

    // Pause the original video
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setIsFullscreen(true);
  };

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);

    // Resume original video if it was playing before
    if (wasPlayingBeforeFullscreen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [wasPlayingBeforeFullscreen]);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, closeFullscreen]);

  // Notify parent when play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]); // Only depend on isPlaying, not onPlayStateChange

  return (
    <>
      <div ref={containerRef} className={`relative group ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={objectFit === "contain" ? "" : "w-full h-full object-cover"}
          style={
            objectFit === "contain"
              ? {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: isPortrait ? 'auto' : '100%',
                  height: isPortrait ? '100%' : 'auto',
                  objectFit: 'contain'
                }
              : undefined
          }
          loop
          muted={muted}
          playsInline
          preload={preload}
        />

        {/* Custom overlay content (title, description, etc) */}
        {children}

        {/* Fullscreen Button - Top Right Corner */}
        <button
          onClick={openFullscreen}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 z-40"
          aria-label="Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 touch-manipulation z-30"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <div className="bg-white/95 rounded-full p-3 sm:p-4 hover:bg-white transition-all duration-150 hover:scale-105">
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary ml-0.5 sm:ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFullscreen}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Container */}
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
              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="absolute -top-8 right-0 sm:-top-10 sm:-right-10 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 group z-10"
                aria-label="Close fullscreen"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>

              {/* Video Player */}
              <div className="bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex items-center justify-center">
                <video
                  src={src}
                  poster={poster}
                  controls
                  autoPlay
                  loop
                  muted={false}
                  className="max-h-[90vh] max-w-full w-auto h-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
