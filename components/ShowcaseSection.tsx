"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface ShowcaseVideo {
  id: number;
  title: string;
  description: string;
  src: string;
  poster: string;
  category: string;
}

// Sample showcase videos
const showcaseVideos: ShowcaseVideo[] = [
  {
    id: 1,
    title: "Tech Product Launch",
    description: "Sleek smartphone reveal with dynamic transitions",
    src: "/videos/showcase1.mp4",
    poster: "/images/showcase1.jpg",
    category: "Product",
  },
  {
    id: 2,
    title: "Fashion Brand Story",
    description: "Elegant fashion collection with cinematic shots",
    src: "/videos/showcase2.mp4",
    poster: "/images/showcase2.jpg",
    category: "Fashion",
  },
  {
    id: 3,
    title: "Food & Beverage Ad",
    description: "Mouth-watering product shots with close-ups",
    src: "/videos/showcase3.mp4",
    poster: "/images/showcase3.jpg",
    category: "F&B",
  },
  {
    id: 4,
    title: "Real Estate Tour",
    description: "Virtual property walkthrough with smooth pans",
    src: "/videos/showcase4.mp4",
    poster: "/images/showcase4.jpg",
    category: "Real Estate",
  },
  {
    id: 5,
    title: "Automotive Showcase",
    description: "Luxury car presentation with dramatic lighting",
    src: "/videos/showcase5.mp4",
    poster: "/images/showcase5.jpg",
    category: "Automotive",
  },
  {
    id: 6,
    title: "SaaS Platform Demo",
    description: "Software interface animation with clean UI",
    src: "/videos/showcase6.mp4",
    poster: "/images/showcase6.jpg",
    category: "Tech",
  },
];

export const ShowcaseSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-bg/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            AI-Generated{" "}
            <span className="text-gradient-purple">Video Showcase</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            See what&apos;s possible with our AI video generation technology.
            Professional results in seconds.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {showcaseVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
              onMouseEnter={() => setHoveredId(video.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Video Container */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-purple-200">
                  {/* Placeholder - Replace with actual VideoPlayer when videos are available */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Play className="w-16 h-16 text-primary/40 mx-auto" />
                      <p className="text-sm text-text-muted">Video Preview</p>
                    </div>
                  </div>

                  {/* Purple Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent transition-opacity duration-300 ${
                      hoveredId === video.id ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-semibold text-primary">
                      {video.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {video.description}
                  </p>
                </div>

                {/* Hover Effect Border */}
                <div
                  className={`absolute inset-0 border-2 border-primary rounded-xl transition-opacity duration-300 pointer-events-none ${
                    hoveredId === video.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-text-secondary mb-6">
            Ready to create your own stunning videos?
          </p>
          <a
            href="#hero"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white gradient-purple rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
          >
            Get Started Free
          </a>
        </motion.div>
      </div>
    </section>
  );
};
