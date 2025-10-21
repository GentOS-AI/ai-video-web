/**
 * API Services
 * Service layer for API calls
 */
import { apiClient } from './client';

// Types
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
  subscription_plan: 'free' | 'basic' | 'pro';
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Video {
  id: number;
  user_id: number;
  prompt: string;
  model: string;
  reference_image_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number | null;
  resolution: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseVideo {
  id: number;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  poster_url: string;
  is_featured: boolean;
  order: number;
}

export interface TrialImage {
  id: number;
  title: string;
  image_url: string;
  category: string | null;
  order: number;
}

export interface RecentUserInfo {
  id: number;
  name: string | null;
  avatar_url: string | null;
  email: string;
}

export interface RecentUsersResponse {
  recent_users: RecentUserInfo[];
  total_count: number;
  display_count: number;
}

export interface UploadedImage {
  id: number;
  filename: string;
  file_url: string;
  file_size: number;
  file_type: string;
  width: number;
  height: number;
  created_at: string;
}

export interface UploadedImagesResponse {
  images: UploadedImage[];
  total: number;
  limit: number;
  offset: number;
}

// Authentication Service
export const authService = {
  /**
   * Login with Google OAuth
   */
  async googleLogin(code: string, redirectUri: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/google', {
      code,
      redirect_uri: redirectUri,
    });
    return data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        // Save cookie consent before clearing
        const cookieConsent = localStorage.getItem('cookie-consent');
        localStorage.clear();
        // Restore cookie consent after clearing
        if (cookieConsent) {
          localStorage.setItem('cookie-consent', cookieConsent);
        }
      }
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },
};

// Video Service
export const videoService = {
  /**
   * Generate a new video
   */
  async generate(
    prompt: string,
    model: string = 'sora-2',
    referenceImageUrl?: string
  ): Promise<Video> {
    const { data } = await apiClient.post<Video>('/videos/generate', {
      prompt,
      model,
      reference_image_url: referenceImageUrl,
    });
    return data;
  },

  /**
   * Get user's video list
   */
  async getVideos(page: number = 1, pageSize: number = 20, status?: string) {
    const { data } = await apiClient.get('/videos', {
      params: {
        page,
        page_size: pageSize,
        status_filter: status,
      },
    });
    return data;
  },

  /**
   * Get specific video details
   */
  async getVideo(id: number): Promise<Video> {
    const { data } = await apiClient.get<Video>(`/videos/${id}`);
    return data;
  },

  /**
   * Delete a video
   */
  async deleteVideo(id: number): Promise<void> {
    await apiClient.delete(`/videos/${id}`);
  },

  /**
   * Retry failed video generation
   */
  async retryVideo(id: number): Promise<Video> {
    const { data } = await apiClient.post<Video>(`/videos/${id}/retry`);
    return data;
  },

  /**
   * Get available AI models
   */
  async getModels() {
    const { data} = await apiClient.get('/videos/models/list');
    return data;
  },

  /**
   * Generate video with flexible mode (Mode 2: Original image + Auto-generate)
   *
   * This is for All-In-One generation:
   * 1. Upload original image
   * 2. Backend auto-enhances image with gpt-image-1
   * 3. Backend generates script with GPT-4o
   * 4. Backend generates video with Sora
   *
   * Use this for one-click video generation from original image
   */
  async generateFlexible(
    imageFile: File,
    userDescription: string,
    options?: {
      duration?: number;
      model?: string;
      language?: string;
    }
  ): Promise<Video> {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('user_description', userDescription);
    formData.append('duration', (options?.duration || 4).toString());
    formData.append('model', options?.model || 'sora-2');
    formData.append('language', options?.language || 'en');

    const { data } = await apiClient.post<Video>('/videos/generate-flexible', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

// Showcase Service
export const showcaseService = {
  /**
   * Get showcase videos
   */
  async getShowcaseVideos(limit: number = 6, category?: string) {
    const { data } = await apiClient.get('/showcase/videos', {
      params: { limit, category },
    });
    return data;
  },

  /**
   * Get featured videos
   */
  async getFeaturedVideos(limit: number = 6) {
    const { data } = await apiClient.get('/showcase/featured', {
      params: { limit },
    });
    return data;
  },

  /**
   * Get hero carousel videos
   */
  async getHeroVideos(limit: number = 3) {
    const { data } = await apiClient.get('/showcase/hero-videos', {
      params: { limit },
    });
    return data;
  },

  /**
   * Get trial images
   */
  async getTrialImages(limit: number = 8) {
    const { data } = await apiClient.get('/showcase/trial-images', {
      params: { limit },
    });
    return data;
  },
};

// Upload Service
export const uploadService = {
  /**
   * Upload an image file
   */
  async uploadImage(file: File): Promise<{
    file_path: string;
    filename: string;
    file_url: string;
    image_id: number;
    width: number;
    height: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Get uploaded images for current user
   */
  async getUploadedImages(limit: number = 50, offset: number = 0): Promise<UploadedImagesResponse> {
    const { data } = await apiClient.get<UploadedImagesResponse>('/upload/images', {
      params: { limit, offset },
    });
    return data;
  },

  /**
   * Validate file before upload
   */
  async validateFile(file: File): Promise<{ valid: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/upload/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

// User Service
export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/profile');
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(name?: string, avatarUrl?: string): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/profile', {
      name,
      avatar_url: avatarUrl,
    });
    return data;
  },

  /**
   * Get user credits
   */
  async getCredits() {
    const { data } = await apiClient.get('/users/credits');
    return data;
  },

  /**
   * Get recent users (public endpoint)
   */
  async getRecentUsers(): Promise<RecentUsersResponse> {
    const { data } = await apiClient.get<RecentUsersResponse>('/users/recent');
    return data;
  },
};

// Credits Service
export const creditsService = {
  /**
   * Purchase credits package
   */
  async purchaseCredits(purchaseData: {
    package: string;
    payment_method: string;
  }): Promise<{
    success: boolean;
    new_balance: number;
    transaction_id: string;
    message: string;
  }> {
    const { data } = await apiClient.post('/credits/purchase', purchaseData);
    return data;
  },
};

// AI Service
export const aiService = {
  /**
   * Generate video script from uploaded product image using GPT-4o
   */
  async generateScript(
    file: File,
    duration: number = 4,
    language: string = 'en'
  ): Promise<{
    script: string;
    style?: string;
    camera?: string;
    lighting?: string;
    tokens_used: number;
    optimized_image_url?: string; // AI optimized image URL (optional, backend will add this)
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', duration.toString());
    formData.append('language', language);

    const { data } = await apiClient.post('/ai/generate-script', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Enhanced script generation with gpt-image-1 and GPT-4o (SYNCHRONOUS)
   * Process:
   * 1. Auto-detect image orientation from uploaded image
   * 2. GPT-4o analyzes image and generates gpt-image-1 prompt
   * 3. gpt-image-1 generates enhanced advertising image (1536x1024 or 1024x1536)
   * 4. Resize for video (1280x720 or 720x1280)
   * 5. GPT-4o generates professional advertising script
   */
  async enhanceAndGenerateScript(
    file: File,
    userDescription?: string,
    options?: {
      duration?: number;
      language?: string;
    }
  ): Promise<{
    script: string;
    enhanced_image_url: string;
    enhancement_details: {
      mode: string;
      original_size_kb: number;
      enhanced_size_kb: number;
      original_dimensions: string;
      enhanced_dimensions: string;
      adjustments: string[];
      size_reduction?: string;
      resized: boolean;
      auto_oriented: boolean;
    };
    product_analysis: {
      product_type?: string;
      key_features?: string[];
      target_audience?: string;
      unique_selling_points?: string[];
      market_position?: string;
      emotional_appeal?: string;
    };
    style?: string;
    camera?: string;
    lighting?: string;
    tokens_used: number;
    processing_time: number;
    user_input_used: boolean;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    // Add optional user description
    if (userDescription) {
      formData.append('user_description', userDescription);
    }

    // Add options with defaults
    formData.append('duration', (options?.duration || 4).toString());
    formData.append('language', options?.language || 'en');

    const { data } = await apiClient.post('/ai/enhance-and-script', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120 seconds (gpt-image-1 edit takes ~90s + script generation ~30s)
    });
    return data;
  },

  /**
   * Enhanced script generation with gpt-image-1 and GPT-4o (ASYNC with SSE)
   * Returns immediately with task_id, use useEnhancementStream hook to watch progress
   *
   * Process (same as sync version, but async):
   * 1. Auto-detect image orientation from uploaded image
   * 2. Edit and enhance image using gpt-image-1
   * 3. Resize for video requirements
   * 4. Generate advertising script with GPT-4o
   * 5. Stream real-time progress via SSE
   */
  async enhanceAndGenerateScriptAsync(
    file: File,
    userDescription?: string,
    options?: {
      duration?: number;
      language?: string;
    }
  ): Promise<{
    id: number;
    user_id: number;
    original_image_path: string;
    user_description: string;
    enhanced_image_url: string | null;
    script: string | null;
    product_analysis: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message: string | null;
    tokens_used: number;
    processing_time: number | null;
    created_at: string;
    updated_at: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    // Add optional user description
    if (userDescription) {
      formData.append('user_description', userDescription);
    }

    // Add options with defaults
    formData.append('duration', (options?.duration || 4).toString());
    formData.append('language', options?.language || 'en');

    const { data } = await apiClient.post('/ai/enhance-and-script-async', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Get enhancement task status (for polling)
   */
  async getEnhancementStatus(taskId: number): Promise<{
    id: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    enhanced_image_url: string | null;
    script: string | null;
    product_analysis: string | null;
    error_message: string | null;
    tokens_used: number;
    processing_time: number | null;
    updated_at: string;
  }> {
    const { data } = await apiClient.get(`/ai/enhance-and-script/${taskId}/status`);
    return data;
  },
};

// Payment Service
export const paymentService = {
  /**
   * Create Stripe Checkout Session
   */
  async createCheckoutSession(
    productType: 'basic' | 'pro' | 'credits',
    successUrl: string,
    cancelUrl: string
  ): Promise<{
    session_id: string;
    url: string;
    publishable_key: string;
  }> {
    const { data } = await apiClient.post('/payments/create-checkout-session', {
      product_type: productType,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return data;
  },

  /**
   * Get payment session status
   */
  async getSessionStatus(sessionId: string) {
    const { data } = await apiClient.get(`/payments/session/${sessionId}`);
    return data;
  },

  /**
   * Get pricing information from backend
   */
  async getPricing() {
    const { data } = await apiClient.get('/payments/pricing');
    return data;
  },

  /**
   * Get Stripe configuration
   */
  async getStripeConfig() {
    const { data } = await apiClient.get('/payments/config');
    return data;
  },
};
