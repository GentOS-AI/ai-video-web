"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Video as VideoIcon, Loader2, Film, RefreshCw, Image as ImageIconLucide, Play, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { VideoCard } from "@/components/VideoCard";
import { VideoStatusFilter, type VideoStatusType } from "@/components/VideoStatusFilter";
import { getUserVideos, deleteVideo, retryVideo, type Video } from "@/lib/services/videoService";
import { uploadService, videoService, type UploadedImage } from "@/lib/api/services";

// Lazy load VideoModal - only loaded when user clicks play
const VideoModal = dynamic(
  () => import("@/components/VideoModal").then((mod) => ({ default: mod.VideoModal })),
  { ssr: false }
);

type TabType = 'videos' | 'images';

export default function MediaCenterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { showToast, showConfirm } = useNotification();
  const t = useTranslations('myVideos');
  const tToast = useTranslations('toast');
  const tConfirm = useTranslations('confirm');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  // Video states
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<VideoStatusType>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Image modal states
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageMenuOpen, setImageMenuOpen] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);

  // Image states
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagePage, setImagePage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [loadingMoreImages, setLoadingMoreImages] = useState(false);

  // Totals
  const [totalImagesCount, setTotalImagesCount] = useState(0);
  const [totalVideosCount, setTotalVideosCount] = useState(0);

  // Video status counts for filter badges
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  const initialLoadRef = useRef(false);

  // Fetch videos
  const fetchVideos = useCallback(async (pageNum: number = 1, append: boolean = false, statusOverride?: VideoStatusType) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMoreVideos(true);
      }
      setError(null);

      const response = await getUserVideos(
        pageNum,
        20,
        (statusOverride ?? activeStatus) === 'all' ? undefined : (statusOverride ?? activeStatus)
      );

      if (append) {
        setVideos(prev => [...prev, ...response.videos]);
      } else {
        setVideos(response.videos);
      }

      setTotalVideos(response.total);
      setTotalVideosCount(response.total);
      setPage(pageNum);
      setHasMoreVideos(pageNum * 20 < response.total);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load videos. Please try again.');
      showToast('Failed to load videos', 'error');
    } finally {
      setLoading(false);
      setLoadingMoreVideos(false);
    }
  }, [activeStatus, showToast]);

  // Fetch images
  const fetchImages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1 && !append) {
        setImagesLoading(true);
      } else {
        setLoadingMoreImages(true);
      }

      const offset = (pageNum - 1) * 20;
      const response = await uploadService.getUploadedImages(20, offset);

      if (append) {
        setImages(prev => [...prev, ...response.images]);
      } else {
        setImages(response.images);
      }

      setImagePage(pageNum);
      setHasMoreImages(pageNum * 20 < response.total);
      setTotalImagesCount(response.total);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      showToast('Failed to load images', 'error');
    } finally {
      setImagesLoading(false);
      setLoadingMoreImages(false);
    }
  }, [showToast]);

  const fetchCounts = useCallback(async () => {
    try {
      const [imagesCount, videosCount] = await Promise.all([
        uploadService.getImagesCount(),
        videoService.getVideosCount(),
      ]);
      setTotalImagesCount(imagesCount);
      setTotalVideosCount(videosCount);
    } catch (err) {
      console.error('Failed to fetch media counts:', err);
    }
  }, []);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const [allRes, pendingRes, processingRes, completedRes, failedRes] = await Promise.all([
        getUserVideos(1, 1, undefined),
        getUserVideos(1, 1, 'pending'),
        getUserVideos(1, 1, 'processing'),
        getUserVideos(1, 1, 'completed'),
        getUserVideos(1, 1, 'failed'),
      ]);

      setStatusCounts({
        all: allRes.total,
        pending: pendingRes.total,
        processing: processingRes.total,
        completed: completedRes.total,
        failed: failedRes.total,
      });
    } catch (err) {
      console.error('Failed to fetch status counts:', err);
    }
  }, []);

  // Initial fetch - load counts and first page once after authentication
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      initialLoadRef.current = false;
      router.push('/');
      return;
    }

    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCounts();
      fetchStatusCounts();
      fetchVideos(1, false);
      fetchImages(1, false);
    }
  }, [authLoading, isAuthenticated, router, fetchCounts, fetchStatusCounts, fetchVideos, fetchImages]);

  // Auto-refresh removed - users can manually refresh using the button

  // Filter videos by active status
  const filteredVideos = videos;

  // Handlers
  const handlePlay = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const targetVideo = videos.find(v => v.id === id);

    showConfirm({
      title: tConfirm('deleteVideo.title'),
      message: tConfirm('deleteVideo.message'),
      confirmText: tConfirm('deleteVideo.confirm'),
      cancelText: tConfirm('deleteVideo.cancel'),
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteVideo(id);
          setVideos(prev => prev.filter(v => v.id !== id));
          setTotalVideos(prev => Math.max(0, prev - 1));
          setTotalVideosCount(prev => Math.max(0, prev - 1));
          if (targetVideo) {
            setStatusCounts(prev => {
              const updated = { ...prev };
              updated.all = Math.max(0, updated.all - 1);
              const key = targetVideo.status as keyof typeof prev;
              updated[key] = Math.max(0, updated[key] - 1);
              return updated;
            });
          }
          fetchCounts();
          fetchStatusCounts();
          showToast(tToast('videoDeleted'), 'success');
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
      fetchStatusCounts();
      showToast('Video generation restarted', 'success');
    } catch (err) {
      console.error('Failed to retry video:', err);
      showToast('Failed to retry video generation', 'error');
    }
  };

  const handleStatusChange = (status: VideoStatusType) => {
    setActiveStatus(status);
    setPage(1);
    setHasMoreVideos(true);
    setVideos([]);
    fetchVideos(1, false, status);
  };

  const handleManualRefresh = async () => {
    await Promise.all([
      fetchVideos(1, false),
      fetchCounts(),
      fetchStatusCounts(),
    ]);
    setPage(1);
    setHasMoreVideos(true);
    showToast(tToast('videoListRefreshed'), 'success');
  };

  const handleLoadMoreVideos = () => {
    if (loadingMoreVideos || !hasMoreVideos) return;
    fetchVideos(page + 1, true);
  };

  const handleLoadMoreImages = () => {
    if (loadingMoreImages || !hasMoreImages) return;
    fetchImages(imagePage + 1, true);
  };

  const handleDeleteImage = async (imageId: number) => {
    showConfirm({
      title: tConfirm('deleteImage.title'),
      message: tConfirm('deleteImage.message'),
      confirmText: tConfirm('deleteImage.confirm'),
      cancelText: tConfirm('deleteImage.cancel'),
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await uploadService.deleteImage(imageId);
          setImages(prev => prev.filter(img => img.id !== imageId));
          setTotalImagesCount(prev => Math.max(0, prev - 1));
          fetchCounts();
          showToast('Image deleted successfully', 'success');
        } catch (err) {
          console.error('Failed to delete image:', err);
          showToast('Failed to delete image', 'error');
        }
      }
    });
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
              {t('backToHome')}
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
                    quality={75}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center shadow-lg">
                  <VideoIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {t('mediaCenter')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.name ? t('userLibrary', { name: user.name }) : t('manageContent')}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => {
                  if (activeTab !== 'images') {
                    setActiveTab('images');
                    setImagePage(1);
                    setHasMoreImages(true);
                    if (images.length === 0) {
                      fetchImages(1, false);
                    }
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'images'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <ImageIconLucide className="w-5 h-5" />
                <span>{t('tabs.images')}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'images' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {totalImagesCount}
                </span>
              </button>
              <button
                onClick={() => {
                  if (activeTab !== 'videos') {
                    setActiveTab('videos');
                    setPage(1);
                    setHasMoreVideos(true);
                    if (videos.length === 0) {
                      fetchVideos(1, false);
                    }
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'videos'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>{t('tabs.videos')}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'videos' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {totalVideosCount}
                </span>
              </button>
            </div>

            {/* Video Tab - Status Filter and Refresh */}
            {activeTab === 'videos' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <VideoStatusFilter
                  activeStatus={activeStatus}
                  onStatusChange={handleStatusChange}
                  counts={statusCounts}
                />

                {/* Refresh Button */}
                {videos.some(v => v.status === 'pending' || v.status === 'processing') && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-purple-600 ${loading ? 'animate-spin' : ''}`}
                    />
                    <span className="text-sm font-medium text-purple-700">
                      {loading ? t('refreshing') : t('refresh')}
                    </span>
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'videos' ? (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600">{t('loadingVideos')}</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={() => fetchVideos(1, false)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {t('tryAgain')}
                    </button>
                  </div>
                ) : filteredVideos.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Film className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('noVideos')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeStatus === 'all'
                        ? t('noVideosDescription')
                        : t('noVideosWithStatus', { status: activeStatus })}
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gradient-purple text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {t('generateVideo')}
                    </button>
                  </div>
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
                      {t('showing', { count: Math.min(filteredVideos.length, totalVideos), total: totalVideos })}
                    </div>

                    {hasMoreVideos && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleLoadMoreVideos}
                          disabled={loadingMoreVideos}
                          className="px-5 py-2.5 bg-gradient-purple text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMoreVideos ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t('loadingMore')}
                            </span>
                          ) : (
                            t('loadMoreVideos')
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="images"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {imagesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600">{t('loadingImages')}</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-200">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <ImageIconLucide className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('noImagesYet')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('uploadFirstImage')}
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gradient-purple text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {t('uploadImage')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {images.map((image) => {
                        return (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="relative group cursor-pointer"
                          >
                            {/* Image Container - Fixed Square */}
                            <div
                              className="relative w-full aspect-square bg-slate-900 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-400 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                              onClick={() => {
                                setSelectedImage(image);
                                setIsImageModalOpen(true);
                              }}
                            >
                              <Image
                                src={image.file_url}
                                alt={image.filename}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                loading="lazy"
                                quality={80}
                              />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                  <p className="text-sm font-medium">{t('clickToEnlarge')}</p>
                                </div>
                              </div>

                              {/* Three-dot menu button (top-right) */}
                              <div
                                className="absolute top-3 right-3 z-30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImageMenuOpen(imageMenuOpen === image.id ? null : image.id);
                                    }}
                                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-700" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {imageMenuOpen === image.id && (
                                    <>
                                      {/* Backdrop to close menu */}
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setImageMenuOpen(null);
                                        }}
                                      />

                                      {/* Menu items */}
                                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setImageMenuOpen(null);
                                            handleDeleteImage(image.id);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          {t('delete')}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Image Info */}
                            <div className="mt-2 px-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                                {image.filename}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {image.width} × {image.height}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                      {t('showingCount', { count: Math.min(images.length, totalImagesCount), total: totalImagesCount, type: t('tabs.images').toLowerCase() })}
                    </div>

                    {hasMoreImages && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleLoadMoreImages}
                          disabled={loadingMoreImages}
                          className="px-5 py-2.5 bg-gradient-purple text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMoreImages ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t('loadingMore')}
                            </span>
                          ) : (
                            t('loadMoreImages')
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Image Enlarge Modal */}
      <AnimatePresence>
        {isImageModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsImageModalOpen(false);
              setSelectedImage(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={selectedImage.file_url}
                  alt={selectedImage.filename}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {selectedImage.filename}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                    <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                      📐 {selectedImage.width} × {selectedImage.height}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                      💾 {(selectedImage.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                      📁 {selectedImage.file_type.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                      🕒 {new Date(selectedImage.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
