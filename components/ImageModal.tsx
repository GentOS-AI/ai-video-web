"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
  imageUrl: string | null;
  imageTitle: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSize?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal = ({
  imageUrl,
  imageTitle,
  imageWidth,
  imageHeight,
  imageSize,
  isOpen,
  onClose
}: ImageModalProps) => {
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

  if (!imageUrl) return null;

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageTitle || `image_${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-7xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with info */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="text-white">
                <p className="font-medium text-lg truncate max-w-md">{imageTitle}</p>
                {imageWidth && imageHeight && (
                  <p className="text-sm text-white/70">
                    {imageWidth} × {imageHeight}
                    {imageSize && ` • ${(imageSize / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200"
                  aria-label="Download image"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 group"
                  aria-label="Close image"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 rounded-lg overflow-hidden bg-stone-900 flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={imageTitle}
                width={imageWidth || 1280}
                height={imageHeight || 720}
                className="max-h-[80vh] w-auto h-auto object-contain"
                quality={100}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
