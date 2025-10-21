"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Youtube } from "lucide-react";

// TikTok icon component
const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface ShareDropdownProps {
  videoUrl: string | null;
  videoTitle: string;
  onShareToYouTube?: () => void;
  onShareToTikTok?: () => void;
  className?: string;
}

export const ShareDropdown = ({
  videoUrl,
  onShareToYouTube,
  onShareToTikTok,
  className = "",
}: ShareDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleYouTubeShare = () => {
    setIsOpen(false);
    if (onShareToYouTube) {
      onShareToYouTube();
    }
  };

  const handleTikTokShare = () => {
    setIsOpen(false);
    if (onShareToTikTok) {
      onShareToTikTok();
    }
  };

  if (!videoUrl) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors relative"
        title="Share to YouTube"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Dropdown Menu - Positioned below the button */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Arrow pointing up to the button */}
          <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

          {/* YouTube Share Option */}
          {onShareToYouTube && (
            <button
              onClick={handleYouTubeShare}
              className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center group-hover:bg-red-700 transition-colors">
                <Youtube className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Share to YouTube</div>
                <div className="text-xs text-gray-500">Upload to your channel</div>
              </div>
            </button>
          )}

          {/* TikTok Share Option */}
          {onShareToTikTok && (
            <button
              onClick={handleTikTokShare}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <TikTokIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Share to TikTok</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
