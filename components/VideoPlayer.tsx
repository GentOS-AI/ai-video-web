"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  preload?: "none" | "metadata" | "auto";
  onPlayStateChange?: (isPlaying: boolean) => void;
  children?: React.ReactNode;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = "",
  autoPlay = false,
  preload = "metadata",
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
        preload={preload}
      />

      {/* Custom overlay content (title, description, etc) */}
      {children}

      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 touch-manipulation z-30"
        aria-label={isPlaying ? "Pause video" : "Play video"}
        style={{ willChange: "opacity" }}
      >
        <div className="bg-white/95 rounded-full p-3 sm:p-4 hover:bg-white transition-all duration-150 hover:scale-105" style={{ willChange: "transform" }}>
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
