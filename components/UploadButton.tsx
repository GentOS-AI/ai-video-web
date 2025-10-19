"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  onFileSelect?: (file: File) => void;
  onValidationError?: (error: string) => void;
  className?: string;
}

// File validation constants
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

// Sora 2 API supported image dimensions (width x height)
// ONLY 1280x720 and 720x1280 are supported
const SUPPORTED_DIMENSIONS = [
  { width: 1280, height: 720, label: "1280x720 (16:9 Landscape)" },
  { width: 720, height: 1280, label: "720x1280 (9:16 Portrait)" },
];

export const UploadButton: React.FC<UploadButtonProps> = ({
  onFileSelect,
  onValidationError,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return "Invalid file type. Only JPG and PNG images are allowed.";
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
      return "Invalid file extension. Only .jpg, .jpeg, and .png files are allowed.";
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `File too large (${sizeMB}MB). Maximum size is 20MB.`;
    }

    // Check minimum size
    if (file.size < 1024) {
      return "File is too small or corrupted.";
    }

    return null;
  };

  const handleFileChange = (file: File) => {
    setError(null);

    if (!file) return;

    // Validate file type and size
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onValidationError?.(validationError);
      return;
    }

    // Only process image files
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;

        // Validate image dimensions
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // Check if dimensions match any supported size
          const isSupported = SUPPORTED_DIMENSIONS.some(
            dim => dim.width === width && dim.height === height
          );

          if (!isSupported) {
            const supportedSizes = SUPPORTED_DIMENSIONS.map(d => d.label).join(", ");
            const errorMsg = `Image dimensions (${width}x${height}) not supported. Please use one of: ${supportedSizes}`;
            setError(errorMsg);
            onValidationError?.(errorMsg);
            setPreview(null);
            return;
          }

          // Dimensions are valid
          setPreview(result);
          onFileSelect?.(file);
        };

        img.onerror = () => {
          const errorMsg = "Failed to load image. Please try a different file.";
          setError(errorMsg);
          onValidationError?.(errorMsg);
          setPreview(null);
        };

        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer overflow-hidden",
        isDragging
          ? "border-primary bg-purple-bg"
          : "border-gray-300 hover:border-primary",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />

      {preview ? (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 space-y-2">
          <ImageIcon className={`w-10 h-10 ${error ? 'text-red-400' : 'text-text-muted'}`} />
          <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-text-secondary'}`}>
            {error || 'Upload Reference Image'}
          </p>
          {!error && (
            <>
              <p className="text-xs text-text-muted">
                JPG/PNG, max 20MB
              </p>
              <p className="text-xs text-text-muted font-medium">
                Only 1280x720 or 720x1280
              </p>
            </>
          )}
          {error && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="w-3 h-3" />
              <span>Please try again</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
