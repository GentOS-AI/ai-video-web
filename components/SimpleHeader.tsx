"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  backUrl?: string;
}

export const SimpleHeader = ({
  title,
  subtitle,
  icon,
  backUrl = "/",
}: SimpleHeaderProps) => {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
