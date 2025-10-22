"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use Intersection Observer to detect if video is in viewport
  const isInViewport = useIntersectionObserver(containerRef, {
    threshold: 0.5, // 50% visible
  });

  // Detect if video is portrait (height > width)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const isVideoPortrait = video.videoHeight > video.videoWidth;
      setIsPortrait(isVideoPortrait);

      // Notify parent component of video dimensions
      if (onOrientationChange) {
        onOrientationChange(video.videoWidth, video.videoHeight);
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

  // Notify parent when play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]); // Only depend on isPlaying, not onPlayStateChange

  return (
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
  );
};
