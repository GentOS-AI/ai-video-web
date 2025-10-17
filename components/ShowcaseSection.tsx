"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VideoPlayer } from "./VideoPlayer";
import { ChevronLeft, ChevronRight, Grid, Package, Shirt, Coffee, Home, Car, Laptop } from "lucide-react";
import { showcaseVideos } from "@/lib/assets";

export const ShowcaseSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Category buttons configuration
  const categories = [
    { name: "All", icon: Grid },
    { name: "Product", icon: Package },
    { name: "Fashion", icon: Shirt },
    { name: "F&B", icon: Coffee },
    { name: "Real Estate", icon: Home },
    { name: "Automotive", icon: Car },
    { name: "Tech", icon: Laptop },
  ];

  // Filter videos by category
  const filteredVideos = selectedCategory === "All"
    ? showcaseVideos
    : showcaseVideos.filter(video => video.category === selectedCategory);

  // Calculate pagination - 6 videos per page (2 rows x 3 columns)
  const videosPerPage = 6;
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  // Get current page videos
  const startIndex = currentPage * videosPerPage;
  const currentVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handlePlayStateChange = (videoId: number, isPlaying: boolean) => {
    setPlayingVideos((prev) => {
      const newSet = new Set(prev);
      if (isPlaying) {
        newSet.add(videoId);
      } else {
        newSet.delete(videoId);
      }
      return newSet;
    });
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-bg/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16 space-y-2 sm:space-y-4"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            AI-Generated{" "}
            <span className="text-gradient-purple">Video Showcase</span>
          </h2>
          <p className="text-sm sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            See what&apos;s possible with our AI video generation technology.
            Professional results in seconds.
          </p>
        </motion.div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 px-4"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.name;

            return (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setCurrentPage(0); // Reset to first page when changing category
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:shadow-md"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons - Mobile inline, desktop outside */}
          <button
            onClick={prevPage}
            className="absolute left-2 sm:-translate-x-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center border border-gray-200 hover:border-purple-300"
            aria-label="Previous videos"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>

          <button
            onClick={nextPage}
            className="absolute right-2 sm:translate-x-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center border border-gray-200 hover:border-purple-300"
            aria-label="Next videos"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>

          {/* Video Grid with Optimized Animation */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          >
            {currentVideos.map((video, index) => {
              const isHovered = hoveredId === video.id;
              const isPlaying = playingVideos.has(video.id);

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02, ease: "easeOut" }}
                  className="group"
                  onMouseEnter={() => setHoveredId(video.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ willChange: "transform, opacity" }}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200 hover:-translate-y-1" style={{ willChange: "transform" }}>
                    {/* Video Container with aspect ratio */}
                    <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-purple-200">
                      <VideoPlayer
                        src={video.src}
                        poster={video.poster}
                        autoPlay={false}
                        preload="none"
                        onPlayStateChange={(playing) => handlePlayStateChange(video.id, playing)}
                      >
                        {/* Purple Gradient Overlay on Hover - Optimized */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent transition-opacity duration-200 pointer-events-none z-10 ${
                            isHovered ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ willChange: "opacity" }}
                        />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full z-10">
                          <span className="text-xs font-semibold text-primary">
                            {video.category}
                          </span>
                        </div>

                        {/* Title and Description Overlay - Hidden when playing */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4
                                      bg-gradient-to-t from-black/80 via-black/60 to-transparent
                                      transition-all duration-300 ${
                                        isPlaying ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                                      }`}
                        >
                          {/* Title - Always visible when not playing */}
                          <h3 className="text-white font-bold text-sm sm:text-base mb-1 drop-shadow-lg">
                            {video.title}
                          </h3>

                          {/* Description - Only visible on hover */}
                          <div
                            className={`transition-all duration-300 overflow-hidden ${
                              isHovered && !isPlaying
                                ? "max-h-20 opacity-100 mt-1"
                                : "max-h-0 opacity-0 mt-0"
                            }`}
                          >
                            <p className="text-white/90 text-xs sm:text-sm line-clamp-2 drop-shadow-md">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      </VideoPlayer>
                    </div>

                    {/* Hover Effect Border */}
                    <div
                      className={`absolute inset-0 border-2 border-primary rounded-xl transition-opacity duration-300 pointer-events-none ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`transition-all ${
                  index === currentPage
                    ? "w-8 h-2 bg-primary rounded-full"
                    : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 px-4">
            Ready to create your own stunning videos?
          </p>
          <a
            href="#hero"
            className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            <span className="sm:hidden">Start Free</span>
            <span className="hidden sm:inline">Get Started Free</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
