"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = "",
  size = 32
}) => {
  const controls = useAnimationControls();
  const hasAnimated = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 检测滚动（向上或向下滚动超过 50px）
      if (Math.abs(currentScrollY - lastScrollY.current) > 50 && !hasAnimated.current) {
        hasAnimated.current = true;

        // 触发旋转动画
        controls.start({
          rotate: 360,
          transition: { duration: 0.6, ease: "easeInOut" }
        }).then(() => {
          // 动画完成后重置状态
          controls.set({ rotate: 0 });

          // 2秒后允许再次触发
          timeoutId = setTimeout(() => {
            hasAnimated.current = false;
          }, 2000);
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [controls]);

  return (
    <motion.div
      className={`${className} logo-container`}
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 渐变色定义 - 从黄色到粉色到紫色 */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#eab308", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#9333ea", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Background with rounded corners - 渐变背景 */}
        <rect
          width="32"
          height="32"
          rx="7"
          fill="url(#logoGradient)"
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
