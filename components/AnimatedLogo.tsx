"use client";

import { motion } from "framer-motion";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = "",
  size = 32
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Brand purple gradient */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#7c3aed", stopOpacity: 1 }} />
          </linearGradient>

          {/* Purple glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background with rounded corners */}
        <motion.rect
          width="32"
          height="32"
          rx="7"
          fill="url(#mainGradient)"
          filter="url(#glow)"
        />

        {/* Play triangle */}
        <motion.path
          d="M13 10L23 16L13 22V10Z"
          fill="white"
          opacity="0.95"
          animate={{ opacity: [0.95, 1, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* AI sparkle particles */}
        <g opacity="0.9">
          {/* Top left sparkle */}
          <motion.circle
            cx="8"
            cy="8"
            r="1.2"
            fill="white"
            animate={{
              r: [1.2, 1.6, 1.2],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Top right sparkle */}
          <motion.circle
            cx="25"
            cy="7"
            r="0.9"
            fill="white"
            animate={{
              r: [0.9, 1.3, 0.9],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
          />

          {/* Bottom right sparkle */}
          <motion.circle
            cx="24"
            cy="25"
            r="1.4"
            fill="white"
            animate={{
              r: [1.4, 1.8, 1.4],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1.8, delay: 0.3, repeat: Infinity }}
          />

          {/* Bottom left sparkle */}
          <motion.circle
            cx="9"
            cy="24"
            r="0.7"
            fill="white"
            animate={{
              r: [0.7, 1.1, 0.7],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ duration: 2.2, delay: 0.7, repeat: Infinity }}
          />
        </g>
      </svg>
    </motion.div>
  );
};
