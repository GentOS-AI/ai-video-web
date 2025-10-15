"use client";

import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className = "",
  autoPlay = false,
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

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover rounded-lg"
        loop
        muted
        autoPlay={autoPlay}
        playsInline
      />
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 hover:bg-white transition-all duration-200 hover:scale-110">
          {isPlaying ? (
            <Pause className="w-8 h-8 text-primary" />
          ) : (
            <Play className="w-8 h-8 text-primary ml-1" />
          )}
        </div>
      </button>
    </div>
  );
};
