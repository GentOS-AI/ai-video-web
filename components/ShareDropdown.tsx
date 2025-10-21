"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Youtube } from "lucide-react";

interface ShareDropdownProps {
  videoUrl: string | null;
  videoTitle: string;
  onShareToYouTube?: () => void;
  className?: string;
}

export const ShareDropdown = ({
  videoUrl,
  videoTitle: _videoTitle,
  onShareToYouTube,
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

      {/* Dropdown Menu - Positioned above the button */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Arrow pointing down to the button */}
          <div className="absolute -bottom-2 right-3 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>

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
        </div>
      )}
    </div>
  );
};
