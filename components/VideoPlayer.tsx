"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  children?: React.ReactNode;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = "",
  autoPlay = false,
  onPlayStateChange,
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
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
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        muted
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
      />

      {/* Custom overlay content (title, description, etc) */}
      {children}

      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 touch-manipulation z-30"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 sm:p-4 hover:bg-white transition-all duration-200 hover:scale-110">
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
