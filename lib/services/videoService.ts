/**
 * Video Service - API calls for video management
 */

import { apiClient } from '@/lib/api/client';

export interface Video {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  reference_image_url: string;
  video_url: string | null;
  poster_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number | null;
  resolution: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoListResponse {
  videos: Video[];
  total: number;
  page: number;
  page_size: number;
}

export interface VideoGenerateRequest {
  prompt: string;
  model: string;
  reference_image_url: string;
}

/**
 * Get user's video list with pagination and filtering
 */
export async function getUserVideos(
  page: number = 1,
  pageSize: number = 20,
  statusFilter?: string
): Promise<VideoListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (statusFilter && statusFilter !== 'all') {
    params.append('status_filter', statusFilter);
  }

  const response = await apiClient.get(`/videos?${params.toString()}`);
  return response.data;
}

/**
 * Get single video by ID
 */
export async function getVideoById(id: number): Promise<Video> {
  const response = await apiClient.get(`/videos/${id}`);
  return response.data;
}

/**
 * Delete a video
 */
export async function deleteVideo(id: number): Promise<void> {
  await apiClient.delete(`/videos/${id}`);
}

/**
 * Retry failed video generation
 */
export async function retryVideo(id: number): Promise<Video> {
  const response = await apiClient.post(`/videos/${id}/retry`);
  return response.data;
}

/**
 * Generate a new video
 */
export async function generateVideo(
  request: VideoGenerateRequest
): Promise<Video> {
  const response = await apiClient.post('/videos/generate', request);
  return response.data;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  // Format as date for older items
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
