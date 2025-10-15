"use client";

import { useState } from "react";
import { Button } from "./Button";
import { UploadButton } from "./UploadButton";
import { VideoPlayer } from "./VideoPlayer";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Sample video data (placeholder - replace with actual video URLs)
const sampleVideos = [
  {
    id: 1,
    src: "/videos/sample1.mp4",
    poster: "/images/poster1.jpg",
    title: "Product Launch",
  },
  {
    id: 2,
    src: "/videos/sample2.mp4",
    poster: "/images/poster2.jpg",
    title: "Brand Story",
  },
  {
    id: 3,
    src: "/videos/sample3.mp4",
    poster: "/images/poster3.jpg",
    title: "Commercial Ad",
  },
];

// Free trial sample images
const trialImages = [
  { id: 1, src: "/images/sample1.jpg", alt: "Sample 1" },
  { id: 2, src: "/images/sample2.jpg", alt: "Sample 2" },
  { id: 3, src: "/images/sample3.jpg", alt: "Sample 3" },
  { id: 4, src: "/images/sample4.jpg", alt: "Sample 4" },
];

export const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setPrompt(text);
      setCharCount(text.length);
    }
  };

  const handleGenerate = () => {
    console.log("Generating video with prompt:", prompt);
    // Add generation logic here
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % sampleVideos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex(
      (prev) => (prev - 1 + sampleVideos.length) % sampleVideos.length
    );
  };

  // Get current video safely
  const currentVideo = sampleVideos[currentVideoIndex];
  if (!currentVideo) {
    return null; // Safety check, should never happen
  }

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Create Stunning{" "}
                <span className="text-gradient-purple">AI Videos</span>
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary">
                Transform your ideas into professional advertising videos in
                seconds with Sora 2 AI technology.
              </p>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-text-primary"
              >
                Describe Your Video
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="A cinematic product showcase with smooth camera movements, professional lighting, and vibrant colors..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={4}
                />
                <div className="absolute bottom-2 right-2 text-xs text-text-muted">
                  {charCount}/{maxChars}
                </div>
              </div>
            </div>

            {/* Free Trial Images */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Free Trial Images
              </label>
              <div className="grid grid-cols-4 gap-3">
                {trialImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === img.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {img.alt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Or Upload Your Own
              </label>
              <UploadButton className="h-32" />
            </div>

            {/* Sora 2 Badge & Generate Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-purple-bg rounded-lg border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Powered by Sora 2
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                className="flex-1 sm:flex-initial gradient-purple hover:opacity-90"
              >
                Generate AI Video
              </Button>
            </div>
          </motion.div>

          {/* Right Side - Video Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <VideoPlayer
                src={currentVideo.src}
                poster={currentVideo.poster}
                autoPlay
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevVideo}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all hover:scale-110 shadow-lg"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>

              <button
                onClick={nextVideo}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all hover:scale-110 shadow-lg"
                aria-label="Next video"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>

              {/* Video Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
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
            </div>

            {/* Video Title */}
            <div className="mt-4 text-center">
              <p className="text-sm text-text-muted">
                Example: {currentVideo.title}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
