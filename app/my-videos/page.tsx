"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Video as VideoIcon, Loader2, Film, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { VideoCard } from "@/components/VideoCard";
import { VideoModal } from "@/components/VideoModal";
import { VideoStatusFilter, type VideoStatusType } from "@/components/VideoStatusFilter";
import { getUserVideos, deleteVideo, retryVideo, type Video } from "@/lib/services/videoService";

export default function MyVideosPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { showToast, showConfirm } = useNotification();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<VideoStatusType>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  // Refresh countdown state
  const [refreshCountdown, setRefreshCountdown] = useState(10);

  // Calculate status counts
  const statusCounts = {
    all: videos.length,
    pending: videos.filter(v => v.status === 'pending').length,
    processing: videos.filter(v => v.status === 'processing').length,
    completed: videos.filter(v => v.status === 'completed').length,
    failed: videos.filter(v => v.status === 'failed').length,
  };

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserVideos(
        page,
        20,
        activeStatus === 'all' ? undefined : activeStatus
      );

      setVideos(response.videos);
      setTotalVideos(response.total);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load videos. Please try again.');
      showToast('Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, showToast]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated, authLoading, router, fetchVideos]);

  // Auto-refresh for processing videos with countdown
  useEffect(() => {
    const hasProcessingVideos = videos.some(
      v => v.status === 'pending' || v.status === 'processing'
    );

    if (!hasProcessingVideos) {
      setRefreshCountdown(10);
      return;
    }

    // Countdown timer (every second)
    const countdownInterval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          return 10; // Reset to 10 seconds
        }
        return prev - 1;
      });
    }, 1000);

    // Refresh data (every 10 seconds)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Refreshing videos with processing status...');
      fetchVideos();
      setRefreshCountdown(10); // Reset countdown
    }, 10000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(refreshInterval);
    };
  }, [videos, fetchVideos]);

  // Filter videos by active status
  const filteredVideos = activeStatus === 'all'
    ? videos
    : videos.filter(v => v.status === activeStatus);

  // Handlers
  const handlePlay = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    showConfirm({
      title: 'Delete Video',
      message: 'Are you sure you want to delete this video? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteVideo(id);
          setVideos(prev => prev.filter(v => v.id !== id));
          showToast('Video deleted successfully', 'success');
        } catch (err) {
          console.error('Failed to delete video:', err);
          showToast('Failed to delete video', 'error');
        }
      }
    });
  };

  const handleRetry = async (id: number) => {
    try {
      const updatedVideo = await retryVideo(id);
      setVideos(prev => prev.map(v => v.id === id ? updatedVideo : v));
      showToast('Video generation restarted', 'success');
    } catch (err) {
      console.error('Failed to retry video:', err);
      showToast('Failed to retry video generation', 'error');
    }
  };

  const handleStatusChange = (status: VideoStatusType) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handleManualRefresh = async () => {
    setRefreshCountdown(10); // Reset countdown
    await fetchVideos();
    showToast('Video list refreshed', 'success');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-4 mb-6">
              {/* User Avatar or Video Icon */}
              {user?.avatar_url ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-purple-100">
                  <Image
                    src={user.avatar_url}
                    alt={user.name || 'User avatar'}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center shadow-lg">
                  <VideoIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  My Videos
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.name ? `${user.name}'s video collection` : 'Manage your AI-generated videos'}
                </p>
              </div>
            </div>

            {/* Status Filter and Refresh Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <VideoStatusFilter
                activeStatus={activeStatus}
                onStatusChange={handleStatusChange}
                counts={statusCounts}
              />

              {/* Refresh Button with Countdown */}
              {videos.some(v => v.status === 'pending' || v.status === 'processing') && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-purple-600 ${loading || refreshCountdown <= 3 ? 'animate-spin' : ''}`}
                  />
                  <span className="text-sm font-medium text-purple-700">
                    {loading ? 'Refreshing...' : `Refresh in ${refreshCountdown}s`}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading your videos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchVideos}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Film className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-600 mb-6">
                {activeStatus === 'all'
                  ? "Start creating your first AI video!"
                  : `No ${activeStatus} videos found.`}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-purple text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Generate Video
              </button>
            </motion.div>
          ) : (
            <>
              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={handlePlay}
                      onDelete={handleDelete}
                      onRetry={handleRetry}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Info */}
              <div className="mt-8 text-center text-sm text-gray-600">
                Showing {filteredVideos.length} of {totalVideos} videos
              </div>
            </>
          )}
        </div>
      </main>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVideo(null);
        }}
      />
    </div>
  );
}
