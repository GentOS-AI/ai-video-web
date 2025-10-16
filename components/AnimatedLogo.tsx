"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = "",
  size = 32
}) => {
  const logoRef = useRef<HTMLDivElement>(null);

  // 监听滚动位置
  const { scrollY } = useScroll();

  // 将滚动距离映射为旋转角度（滚动0-500px时旋转0-360度）
  const rotate = useTransform(scrollY, [0, 500], [0, 360]);

  return (
    <motion.div
      ref={logoRef}
      className={className}
      style={{ rotate }}
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
        {/* Background with rounded corners - 紫色背景 */}
        <rect
          width="32"
          height="32"
          rx="10"
          fill="#8b5cf6"
        />

        {/* Play triangle - 白色播放按钮 */}
        <path
          d="M13 10L23 16L13 22V10Z"
          fill="white"
          opacity="0.95"
        />
      </svg>
    </motion.div>
  );
};
