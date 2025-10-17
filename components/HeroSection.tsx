"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./Button";
import { VideoPlayer } from "./VideoPlayer";
import { Wand2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { heroVideos, trialImages } from "@/lib/assets";
import { videoService, userService, aiService } from "@/lib/api/services";
import type { Video, RecentUsersResponse } from "@/lib/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useVideoStream } from "@/lib/hooks/useVideoStream";

// Lazy load PricingModal since it's only shown on user interaction
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

// Use imported data
const sampleVideos = heroVideos;

// AI Models for dropdown with credit costs
const aiModels = [
  { id: "sora-2", name: "Sora-2", version: "Standard", credits: 100 },
  { id: "sora-2-pro", name: "Sora-2 Pro", version: "Premium", credits: 300 },
];

export const HeroSection = () => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showHelperTooltip, setShowHelperTooltip] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const maxChars = 5000;

  // Video generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<Video | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("Starting...");
  const [streamingVideoId, setStreamingVideoId] = useState<number | null>(null);

  // Script generation states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Use SSE Hook for real-time progress updates
  const { messages, isConnected, lastMessage } = useVideoStream({
    videoId: streamingVideoId,
    onComplete: (videoUrl) => {
      console.log('🎉 Video completed via SSE:', videoUrl);
      setGeneratedVideo({
        ...generatedVideo,
        video_url: videoUrl,
        status: 'completed'
      } as Video);
      setIsGenerating(false);
      setStreamingVideoId(null);
      showToast("Video generated successfully! 🎉", "success");
      refreshUser();
    },
    onError: (error) => {
      console.error('❌ SSE stream error:', error);
      setGenerationError(error);
      setIsGenerating(false);
      setStreamingVideoId(null);
    }
  });

  // Recent users state
  const [recentUsers, setRecentUsers] = useState<RecentUsersResponse | null>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setPrompt(text);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Get current cursor position
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // Calculate new text
    const currentText = prompt;
    const beforeCursor = currentText.substring(0, start);
    const afterCursor = currentText.substring(end);
    const newText = beforeCursor + pastedText + afterCursor;

    // Only update if within character limit
    if (newText.length <= maxChars) {
      setPrompt(newText);

      // Set cursor position after paste
      setTimeout(() => {
        const newCursorPos = start + pastedText.length;
        target.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      // Trim pasted text to fit within limit
      const availableSpace = maxChars - (beforeCursor.length + afterCursor.length);
      if (availableSpace > 0) {
        const trimmedPaste = pastedText.substring(0, availableSpace);
        const trimmedText = beforeCursor + trimmedPaste + afterCursor;
        setPrompt(trimmedText);

        showToast(`Text trimmed to ${maxChars} character limit`, "warning");

        setTimeout(() => {
          const newCursorPos = start + trimmedPaste.length;
          target.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } else {
        showToast(`Cannot paste: ${maxChars} character limit reached`, "warning");
      }
    }
  };

  const handleGenerate = async () => {
    // Validation with Toast notifications
    if (!isAuthenticated) {
      // Redirect to Google OAuth login
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'openid email profile';

      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = googleAuthUrl;
      return;
    }

    // Check if user has a subscription
    if (!user || user.subscription_plan === 'free') {
      showToast("Subscription required. Please upgrade to generate videos!", "warning");
      setIsPricingOpen(true); // Open pricing modal
      return;
    }

    // Check if subscription is active
    if (user.subscription_status !== 'active') {
      showToast("Your subscription has expired. Please renew to continue.", "warning");
      setIsPricingOpen(true);
      return;
    }

    // Check subscription expiry date
    if (user.subscription_end_date) {
      const expiryDate = new Date(user.subscription_end_date);
      const now = new Date();
      if (expiryDate < now) {
        showToast("Your subscription has expired. Please renew to continue.", "warning");
        setIsPricingOpen(true);
        return;
      }
    }

    if (!prompt.trim()) {
      showToast("Please enter a video description", "warning");
      return;
    }

    if (prompt.trim().length < 10) {
      showToast("Video description must be at least 10 characters long", "warning");
      return;
    }

    // Check if either uploaded file or thumbnail is selected
    if (!uploadedFile && selectedImage === null) {
      showToast("Please select or upload an image", "warning");
      return;
    }

    // Check if user has enough credits
    const requiredCredits = selectedModel?.credits || 100;
    if (user.credits < requiredCredits) {
      showToast(`Insufficient credits. You have ${user.credits.toFixed(0)} credits, but need ${requiredCredits} credits for ${selectedModel?.name || 'this model'}.`, "error");
      setIsPricingOpen(true);
      return;
    }

    // Determine image URL based on upload or thumbnail selection
    let imageUrl: string;

    if (uploadedFile) {
      // User uploaded a file - need to upload to backend first
      try {
        setGenerationProgress("Uploading image...");
        const formData = new FormData();
        formData.append('file', uploadedFile);  // Backend expects 'file' parameter

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
        console.log("📤 Image uploaded:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        showToast("Failed to upload image. Please try again.", "error");
        setGenerationProgress("");
        setIsGenerating(false);  // Reset generating state
        return;
      }
    } else if (selectedImage !== null) {
      // User selected a thumbnail
      const selectedImageData = trialImages.find(img => img.id === selectedImage);
      if (!selectedImageData) {
        showToast("Selected image not found", "error");
        return;
      }
      imageUrl = selectedImageData.highResSrc;
    } else {
      showToast("Please select or upload an image", "warning");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationProgress("Starting video generation...");
      console.log("🎬 Generating video with:", {
        prompt,
        model: selectedModel?.id || 'sora-2',
        imageUrl: imageUrl,  // Use uploaded or selected image URL
      });

      // Call video generation API with image URL
      const video = await videoService.generate(
        prompt,
        selectedModel?.id || 'sora-2',
        imageUrl  // Use uploaded file URL or thumbnail high-res URL
      );

      console.log("✅ Video generation task created:", video);
      setGenerationProgress("Connecting to processing stream...");

      // Start SSE connection for real-time updates (replaces polling)
      setStreamingVideoId(video.id);

      // Refresh user credits
      await refreshUser();

    } catch (error: unknown) {
      console.error("❌ Video generation failed:", error);
      if (error instanceof Error) {
        setGenerationError(error.message || "Failed to generate video");
      } else {
        setGenerationError("Failed to generate video");
      }
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async () => {
    // Validation
    if (!isAuthenticated) {
      showToast("Please login to use AI Script Generator", "warning");
      // Redirect to Google OAuth login
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'openid email profile';

      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = googleAuthUrl;
      return;
    }

    // Check subscription
    if (!user || user.subscription_plan === 'free') {
      showToast("AI Script Generator requires a subscription. Please upgrade!", "warning");
      setIsPricingOpen(true);
      return;
    }

    if (user.subscription_status !== 'active') {
      showToast("Your subscription has expired. Please renew to continue.", "warning");
      setIsPricingOpen(true);
      return;
    }

    // Check if image is uploaded (not thumbnail selected)
    if (!uploadedFile) {
      showToast("Please upload an image first. Thumbnail selection is not supported for script generation.", "warning");
      return;
    }

    try {
      setIsGeneratingScript(true);
      console.log("🤖 Generating script from image...");

      // Call AI service
      const result = await aiService.generateScript(uploadedFile, 4);

      console.log("✅ Script generated:", result);

      // Fill the textarea with generated script
      setPrompt(result.script);

      showToast("Script generated successfully! ✨", "success");

      // Optional: Log additional info
      if (result.style || result.camera || result.lighting) {
        console.log("Script details:", {
          style: result.style,
          camera: result.camera,
          lighting: result.lighting,
          tokens: result.tokens_used
        });
      }

    } catch (error: unknown) {
      console.error("❌ Script generation failed:", error);
      if (error instanceof Error) {
        showToast(error.message || "Failed to generate script", "error");
      } else {
        showToast("Failed to generate script", "error");
      }
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setSelectedImage(null); // Clear thumbnail selection when file is uploaded

    // Create preview URL for uploaded file
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    console.log("📁 File uploaded:", file.name, `${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  };

  const handleFileValidationError = (error: string) => {
    showToast(error, "error");
    setUploadedFile(null);
    setUploadedFilePreview(null);
  };

  // Update progress text based on SSE messages
  useEffect(() => {
    if (lastMessage?.message) {
      setGenerationProgress(lastMessage.message);
    }
  }, [lastMessage]);

  // Fetch recent users on mount
  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const data = await userService.getRecentUsers();
        setRecentUsers(data);
      } catch (error) {
        console.error("Failed to fetch recent users:", error);
        // Use fallback data if API fails
        setRecentUsers({
          recent_users: [],
          total_count: 135,
          display_count: 7635,
        });
      }
    };

    fetchRecentUsers();
  }, []);

  const handleSubscribe = (planName: string) => {
    console.log(`Subscribing to ${planName} plan`);
    // TODO: Integrate with payment system
    showToast(`You selected the ${planName} plan! Payment integration coming soon.`, "info");
    setIsPricingOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Get current video safely
  const currentVideo = sampleVideos[currentVideoIndex];
  if (!currentVideo) {
    return null; // Safety check, should never happen
  }

  return (
    <section className="pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="w-full md:max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-end">
          {/* Left Side - Generation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4 sm:space-y-6 order-2 lg:order-1"
          >
            {/* Heading */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Generate{" "}
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  Ads
                </span>{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
                  Video
                </span>{" "}
                for your social media.
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-text-secondary leading-relaxed">
                AI-powered solution for script writing, video generation, and social media publishing.
              </p>
            </div>

            {/* Integrated Input Card */}
            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-visible transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10">
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-white/0">
                {/* Left: AI Script Generator with Tooltip - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-2 relative">
                  <button
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript}
                    onMouseEnter={() => setShowHelperTooltip(true)}
                    onMouseLeave={() => setShowHelperTooltip(false)}
                  >
                    {isGeneratingScript ? (
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 text-purple-600" />
                    )}
                    <span className="text-xs font-semibold text-purple-600 relative pr-5">
                      {isGeneratingScript ? "Generating..." : "AI Script Generator"}

                      {/* Pro Badge - positioned at top-right with spacing */}
                      <span className="absolute -top-2 -right-1 px-1 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[7px] font-bold rounded-sm pointer-events-none">
                        PRO
                      </span>
                    </span>

                    {/* Tooltip - 显示在上方 */}
                    {showHelperTooltip && !isGeneratingScript && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-purple-50 text-purple-900 text-xs rounded-lg shadow-xl shadow-purple-200/50 border-2 border-purple-300 p-3 z-[9999] pointer-events-none">
                        <div className="relative">
                          {/* Arrow - 指向下方 */}
                          <div className="absolute -bottom-5 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-50" />
                          <p className="leading-relaxed">
                            <strong>AI-powered script generation!</strong><br/>
                            Upload an image and click here to automatically generate a professional video script using Gemini AI.
                            {!uploadedFile && <span className="text-red-600 font-semibold"><br/>⚠ Upload an image first</span>}
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Right: Model Selector Dropdown - Centered on mobile */}
                <div
                  ref={dropdownRef}
                  className="relative w-full sm:w-auto flex justify-center sm:justify-end"
                >
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-medium"
                  >
                    <span className="text-text-primary">{selectedModel?.name}</span>
                  </button>

                  {/* Dropdown Menu - Full width on mobile */}
                  {isModelDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      {aiModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left hover:bg-purple-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedModel?.id === model.id ? "bg-purple-50" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-xs font-medium text-text-primary">
                                {model.name}
                              </div>
                              <div className="text-[10px] text-text-muted">
                                {model.version}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                              <span className="text-[10px] font-semibold text-purple-600">
                                {model.credits}
                              </span>
                              <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Input Area */}
              <div className="p-4 sm:p-6">
                <div className="relative pb-10">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={handlePromptChange}
                    onPaste={handlePaste}
                    placeholder="Describe your video: A cinematic product showcase with smooth camera movements, professional lighting, and vibrant colors..."
                    className="w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 resize-none text-sm sm:text-base text-text-primary placeholder:text-text-muted"
                    rows={3}
                  />
                  {/* Generate Button at bottom-right with safe spacing */}
                  <div className="absolute bottom-0 right-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating || isGeneratingScript}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md flex items-center gap-1.5 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {!isAuthenticated || !user || user.subscription_plan === 'free' ? 'Try for free' : 'Generate'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Generation Status/Error Messages */}
              {(isGenerating || generationError) && (
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100">
                  {isGenerating && (
                    <div className="space-y-2">
                      {/* Current Step with Connection Status */}
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="flex-1">{generationProgress}</span>
                        {isConnected && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Connected
                          </span>
                        )}
                      </div>

                      {/* Historical Log Messages (Optional - Shows last 5 steps) */}
                      {messages.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                          {messages.slice(-5).map((msg, index) => (
                            <div key={index} className="flex items-start gap-2 py-0.5">
                              <span className="text-purple-500 font-mono text-[10px] mt-0.5">[{msg.step}]</span>
                              <span className="flex-1">{msg.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {generationError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{generationError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Toolbar */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Upload Button with Uploaded File or Selected Image Preview */}
                  <button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className={`relative flex-shrink-0 rounded-lg transition-all ${
                      uploadedFilePreview || selectedImage !== null
                        ? "w-20 h-20 sm:w-18 sm:h-18 border-4 border-purple-500 shadow-lg shadow-purple-500/50 ring-4 ring-purple-200 scale-110 hover:scale-115"
                        : "w-16 h-16 sm:w-14 sm:h-14 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                    } flex items-center justify-center overflow-hidden`}
                    title={uploadedFilePreview ? "Uploaded image - click to change" : selectedImage !== null ? "Selected image - click to change" : "Upload image"}
                  >
                    {uploadedFilePreview ? (
                      <>
                        {/* Uploaded File Preview */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedFilePreview}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />

                        {/* Upload Badge (different from selection checkmark) */}
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>

                        {/* Corner Accent */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-br-lg" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-tl-lg" />
                      </>
                    ) : selectedImage !== null ? (
                      <>
                        {/* Selected Image Thumbnail */}
                        <Image
                          src={trialImages.find(img => img.id === selectedImage)?.src || ""}
                          alt="Selected"
                          fill
                          className="object-cover"
                          sizes="80px"
                          loading="lazy"
                        />

                        {/* Checkmark Badge */}
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Corner Accent */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-purple-500 rounded-br-lg" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-tl-lg" />
                      </>
                    ) : (
                      <svg
                        className="w-6 h-6 sm:w-6 sm:h-6 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file
                        const MAX_SIZE = 20 * 1024 * 1024; // 20MB
                        const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

                        if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
                          handleFileValidationError("Invalid file type. Only JPG and PNG images are allowed.");
                          return;
                        }

                        if (file.size > MAX_SIZE) {
                          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                          handleFileValidationError(`File too large (${sizeMB}MB). Maximum size is 20MB.`);
                          return;
                        }

                        // Validate image dimensions
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new window.Image();
                          img.onload = () => {
                            const width = img.width;
                            const height = img.height;

                            // Sora 2 API supported dimensions
                            const SUPPORTED_DIMENSIONS = [
                              { width: 1280, height: 720, label: "1280x720 (16:9 Landscape)" },
                              { width: 720, height: 1280, label: "720x1280 (9:16 Portrait)" },
                              { width: 1024, height: 1024, label: "1024x1024 (1:1 Square)" },
                            ];

                            const isSupported = SUPPORTED_DIMENSIONS.some(
                              dim => dim.width === width && dim.height === height
                            );

                            if (!isSupported) {
                              const supportedSizes = SUPPORTED_DIMENSIONS.map(d => d.label).join(", ");
                              handleFileValidationError(
                                `Image dimensions (${width}x${height}) not supported. Please use one of: ${supportedSizes}`
                              );
                              return;
                            }

                            // Dimensions are valid - proceed with upload
                            handleFileUpload(file);
                            showToast(`File uploaded: ${file.name} (${width}x${height})`, "success");
                          };

                          img.onerror = () => {
                            handleFileValidationError("Failed to load image. Please try a different file.");
                          };

                          img.src = event.target?.result as string;
                        };

                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* Trial Images Slider with gradient hint */}
                  <div className="flex-1 relative overflow-hidden">
                    {/* Gradient hints for scrollability */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50/90 to-transparent pointer-events-none z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50/90 to-transparent pointer-events-none z-10" />

                    <div className="overflow-x-auto overflow-y-hidden scrollbar-hide trial-images-slider">
                      <div className="flex gap-2 py-1">
                        {trialImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.id)}
                            className={`relative flex-shrink-0 w-16 h-16 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              selectedImage === img.id
                                ? "border-purple-500 ring-2 ring-purple-300 opacity-100"
                                : "border-gray-300 hover:border-purple-400 opacity-70 hover:opacity-100"
                            }`}
                            title={img.alt}
                          >
                            <Image
                              src={img.src}
                              alt={img.alt}
                              fill
                              className="object-cover"
                              sizes="64px"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  <span className="hidden sm:inline">
                    Upload (1280x720, 720x1280, or 1024x1024) or select an image to start.
                  </span>
                  <span className="sm:hidden">← Swipe to view more images</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Video Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative order-1 lg:order-2"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Simplified Background - Lightweight gradient */}
            <div className="absolute inset-0 -z-10 hidden lg:block">
              {/* Subtle gradient background (no blur filter) */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-pink-50 opacity-40" />
            </div>

            {/* Main Video Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl" style={{ willChange: "transform" }}>
              {/* Show generated video if available */}
              {generatedVideo && generatedVideo.video_url ? (
                <VideoPlayer
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${generatedVideo.video_url}`}
                  poster={generatedVideo.poster_url || undefined}
                  autoPlay={true}
                />
              ) : isGenerating ? (
                /* Loading state */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                  <p className="text-purple-600 font-semibold text-lg mb-2">
                    Generating your video...
                  </p>
                  <p className="text-purple-500 text-sm text-center px-4">
                    {generationProgress}
                  </p>
                </div>
              ) : (
                /* Default sample video */
                <VideoPlayer
                  src={currentVideo.src}
                  poster={currentVideo.poster}
                  autoPlay={false}
                />
              )}

              {/* Video Indicators (only show for sample videos) */}
              {!generatedVideo && !isGenerating && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {sampleVideos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`rounded-full transition-all cursor-pointer ${
                        index === currentVideoIndex
                          ? "bg-white w-8 h-2 shadow-lg"
                          : "bg-white/60 hover:bg-white/90 w-2 h-2 hover:scale-150"
                      }`}
                      aria-label={`Go to video ${index + 1}`}
                      title={`Switch to video ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tech Badges - Smaller size */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              <div className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 shadow-sm">
                <span className="text-[9px] sm:text-[10px] font-semibold text-purple-600 whitespace-nowrap">
                  {generatedVideo ? "1280x720" : "4K Resolution"}
                </span>
              </div>
              <div className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 shadow-sm">
                <span className="text-[9px] sm:text-[10px] font-semibold text-purple-600 whitespace-nowrap">
                  Professional Quality
                </span>
              </div>
              <div className="hidden sm:block px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 shadow-sm">
                <span className="text-[10px] font-semibold text-purple-600 whitespace-nowrap">
                  {generatedVideo ? "AI Generated" : "Auto-Generated"}
                </span>
              </div>
            </div>

            {/* Video Title */}
            <div className="mt-4 sm:mt-5 text-center">
              <p className="text-xs sm:text-sm font-medium text-text-secondary">
                {generatedVideo ? (
                  <>
                    Your Video: <span className="text-purple-600 font-semibold">Generated with Sora 2</span>
                  </>
                ) : (
                  <>
                    Example: <span className="text-purple-600 font-semibold">{currentVideo.title}</span>
                  </>
                )}
              </p>
            </div>

            {/* User Reviews / Social Proof - Reduced padding */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4 px-4 py-3 rounded-lg"
            >
              {/* User Avatars */}
              <div className="flex -space-x-2">
                {recentUsers && recentUsers.recent_users.length > 0 ? (
                  recentUsers.recent_users.map((user) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-sm overflow-hidden"
                      title={user.name || user.email}
                    >
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name || user.email}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.[0] || user.email[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback avatars
                  <>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      A
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      M
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      S
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      J
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      K
                    </div>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Rating and Text */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  <span className="text-purple-600">
                    {recentUsers?.display_count.toLocaleString() || '7,635'}
                  </span> creators trust us
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </section>
  );
};
