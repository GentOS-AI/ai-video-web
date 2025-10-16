"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./Button";
import { VideoPlayer } from "./VideoPlayer";
import { Toast, type ToastType } from "./Toast";
import { Wand2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { heroVideos, trialImages } from "@/lib/assets";
import { videoService, userService } from "@/lib/api/services";
import type { Video, RecentUsersResponse } from "@/lib/api/services";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load PricingModal since it's only shown on user interaction
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

// Use imported data
const sampleVideos = heroVideos;

// AI Models for dropdown
const aiModels = [
  { id: "sora-2", name: "Sora 2", version: "Latest" },
  { id: "sora-1", name: "Sora 1", version: "Stable" },
  { id: "runway-gen3", name: "Runway Gen-3", version: "Beta" },
];

export const HeroSection = () => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showHelperTooltip, setShowHelperTooltip] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const maxChars = 500;

  // Video generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<Video | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("Starting...");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);

  // Recent users state
  const [recentUsers, setRecentUsers] = useState<RecentUsersResponse | null>(null);

  // Helper function to show toast
  const showNotification = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setPrompt(text);
    }
  };

  const handleGenerate = async () => {
    // Validation with Toast notifications
    if (!isAuthenticated) {
      showNotification("Please login to generate videos", "warning");
      return;
    }

    // Check if user has a subscription
    if (!user || user.subscription_plan === 'free') {
      showNotification("Subscription required. Please upgrade to generate videos!", "warning");
      setIsPricingOpen(true); // Open pricing modal
      return;
    }

    // Check if subscription is active
    if (user.subscription_status !== 'active') {
      showNotification("Your subscription has expired. Please renew to continue.", "warning");
      setIsPricingOpen(true);
      return;
    }

    // Check subscription expiry date
    if (user.subscription_end_date) {
      const expiryDate = new Date(user.subscription_end_date);
      const now = new Date();
      if (expiryDate < now) {
        showNotification("Your subscription has expired. Please renew to continue.", "warning");
        setIsPricingOpen(true);
        return;
      }
    }

    if (!prompt.trim()) {
      showNotification("Please enter a video description", "warning");
      return;
    }

    if (selectedImage === null) {
      showNotification("Please select or upload an image", "warning");
      return;
    }

    // Check if user has enough credits (100 credits required)
    if (user.credits < 100) {
      showNotification(`Insufficient credits. You have ${user.credits} credits, but need 100 credits to generate a video.`, "error");
      setIsPricingOpen(true);
      return;
    }

    // Get selected image URL
    const selectedImageData = trialImages.find(img => img.id === selectedImage);
    if (!selectedImageData) {
      showNotification("Selected image not found", "error");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationProgress("Starting video generation...");
      console.log("🎬 Generating video with:", {
        prompt,
        model: selectedModel?.id || 'sora-2',
        imageUrl: selectedImageData.src,
      });

      // Call video generation API
      const video = await videoService.generate(
        prompt,
        selectedModel?.id || 'sora-2',
        selectedImageData.src
      );

      console.log("✅ Video generation task created:", video);
      setGenerationProgress("Video generation in progress... This may take 2-5 minutes.");

      // Start polling for status
      startPolling(video.id);

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

  const startPolling = (videoId: number) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const video = await videoService.getVideo(videoId);
        console.log("📊 Video status:", video.status);

        if (video.status === "completed") {
          console.log("🎉 Video generation completed!");
          setGeneratedVideo(video);
          setIsGenerating(false);
          setGenerationProgress("Video generated successfully!");

          // Show success notification
          showNotification("Video generated successfully! 🎉", "success");

          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Refresh user credits
          await refreshUser();

        } else if (video.status === "failed") {
          console.error("❌ Video generation failed:", video.error_message);
          setGenerationError(video.error_message || "Video generation failed");
          setIsGenerating(false);

          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

        } else if (video.status === "processing") {
          setGenerationProgress("Processing video... Almost there!");
        }

      } catch (error: unknown) {
        console.error("❌ Error checking video status:", error);
        // Don't stop polling on temporary errors
      }
    }, 5000); // Check every 5 seconds
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
    showNotification(`You selected the ${planName} plan! Payment integration coming soon.`, "info");
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
                Create Stunning{" "}
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  AI Videos
                </span>
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-text-secondary leading-relaxed">
                Transform your ideas into professional advertising videos in
                seconds with Sora 2 AI technology.
              </p>
            </div>

            {/* Integrated Input Card */}
            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10">
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-white">
                {/* Left: AI Script Generator with Tooltip - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-2 relative">
                  <button
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    onClick={() => setIsPricingOpen(true)}
                    onMouseEnter={() => setShowHelperTooltip(true)}
                    onMouseLeave={() => setShowHelperTooltip(false)}
                  >
                    <Wand2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 relative pr-5">
                      AI Script Generator

                      {/* Pro Badge - positioned at top-right with spacing */}
                      <span className="absolute -top-2 -right-1 px-1 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[7px] font-bold rounded-sm pointer-events-none">
                        PRO
                      </span>
                    </span>

                    {/* Tooltip */}
                    {showHelperTooltip && (
                      <div className="absolute left-0 top-full mt-2 w-64 bg-purple-50 text-purple-900 text-xs rounded-lg shadow-xl shadow-purple-200/50 border-2 border-purple-300 p-3 z-30 pointer-events-none">
                        <div className="relative">
                          {/* Arrow */}
                          <div className="absolute -top-5 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-purple-50" />
                          <p className="leading-relaxed">
                            <strong>Click to unlock PRO features!</strong><br/>
                            AI-powered script generator helps you craft engaging video descriptions.
                            Get professional results in seconds.
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
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
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
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-primary">
                              {model.name}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {model.version}
                            </span>
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
                      disabled={isGenerating}
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
                          Generate
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
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{generationProgress}</span>
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
                  {/* Upload Button with Selected Image Preview */}
                  <button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className={`relative flex-shrink-0 rounded-lg transition-all ${
                      selectedImage !== null
                        ? "w-20 h-20 sm:w-18 sm:h-18 border-4 border-purple-500 shadow-lg shadow-purple-500/50 ring-4 ring-purple-200 scale-110 hover:scale-115"
                        : "w-16 h-16 sm:w-14 sm:h-14 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                    } flex items-center justify-center overflow-hidden`}
                    title={selectedImage !== null ? "Selected image - click to change" : "Upload image"}
                  >
                    {selectedImage !== null ? (
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

                        {/* Pulsing Glow Effect */}
                        <div className="absolute inset-0 bg-purple-500/20 animate-pulse pointer-events-none" />

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
                    accept="image/*"
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
                  <span className="hidden sm:inline">Upload or select an image to start your free trial.</span>
                  <span className="sm:hidden">← Swipe to view more images</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Video Carousel with Decorations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative order-1 lg:order-2"
          >
            {/* Decorative Background Elements - Hidden on mobile */}
            <div className="absolute inset-0 -z-10 hidden lg:block">
              {/* Grid Pattern */}
              <div className="absolute inset-0 grid-pattern opacity-50" />

              {/* Decorative Orbs */}
              <div className="decorative-orb w-64 h-64 -top-10 -right-10" />
              <div className="decorative-orb w-96 h-96 -bottom-20 -left-20 opacity-60" />
              <div className="decorative-orb w-48 h-48 top-1/2 right-10 opacity-40" />
            </div>

            {/* Main Video Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl glow-purple">
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
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentVideoIndex
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to video ${index + 1}`}
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

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </section>
  );
};
