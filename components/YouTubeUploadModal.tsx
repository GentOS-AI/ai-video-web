"use client";

import { useState, useEffect } from "react";
import { X, Youtube, Lock, Globe, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface YouTubeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  onUpload: (metadata: YouTubeVideoMetadata) => Promise<void>;
}

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  privacy: "private" | "unlisted" | "public";
  tags: string[];
}

const PRIVACY_OPTIONS = [
  {
    value: "private" as const,
    label: "Private",
    description: "Only you can see this video",
    icon: Lock,
    color: "text-gray-700",
  },
  {
    value: "unlisted" as const,
    label: "Unlisted",
    description: "Anyone with the link can see",
    icon: EyeOff,
    color: "text-blue-700",
  },
  {
    value: "public" as const,
    label: "Public",
    description: "Everyone can see this video",
    icon: Globe,
    color: "text-green-700",
  },
] as const;

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_TAGS = 10;

export const YouTubeUploadModal = ({
  isOpen,
  onClose,
  videoTitle,
  onUpload,
}: YouTubeUploadModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form with video title
  useEffect(() => {
    if (isOpen && videoTitle) {
      setTitle(videoTitle.slice(0, MAX_TITLE_LENGTH));
      setDescription(`AI-generated video created with AIVideo.DIY\n\nPrompt: ${videoTitle}`);
      setTags(["AI", "AIVideo", "VideoGeneration"]);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen, videoTitle]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && tags.length < MAX_TAGS && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      await onUpload({
        title: title.trim(),
        description: description.trim(),
        privacy,
        tags,
      });
      setUploadStatus("success");

      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (uploadStatus !== "uploading") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload to YouTube</h2>
                <p className="text-sm text-gray-600">Share your AI-generated video</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={uploadStatus === "uploading"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Messages */}
            {uploadStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Upload successful!</p>
                  <p className="text-xs text-green-700">Your video is now on YouTube</p>
                </div>
              </motion.div>
            )}

            {uploadStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Upload failed</p>
                  <p className="text-xs text-red-700">{errorMessage || "Please try again"}</p>
                </div>
              </motion.div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                placeholder="Enter video title"
                disabled={uploadStatus === "uploading"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={MAX_TITLE_LENGTH}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/{MAX_TITLE_LENGTH} characters
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                placeholder="Enter video description"
                disabled={uploadStatus === "uploading"}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/{MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRIVACY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = privacy === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setPrivacy(option.value)}
                      disabled={uploadStatus === "uploading"}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${isSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? "text-red-600" : option.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isSelected ? "text-red-900" : "text-gray-900"}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  disabled={uploadStatus === "uploading" || tags.length >= MAX_TAGS}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || uploadStatus === "uploading" || tags.length >= MAX_TAGS}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tags.length}/{MAX_TAGS} tags
              </p>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        disabled={uploadStatus === "uploading"}
                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={uploadStatus === "uploading"}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!title.trim() || uploadStatus === "uploading" || uploadStatus === "success"}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadStatus === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : uploadStatus === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Uploaded
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4" />
                    Upload to YouTube
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
