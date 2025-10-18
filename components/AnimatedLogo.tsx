"use client";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = "",
  size = 32
}) => {
  return (
    <div className={`${className} logo-container group`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg transition-transform duration-150 group-hover:scale-105 group-active:scale-95"
        style={{ willChange: "transform" }}
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
    </div>
  );
};
