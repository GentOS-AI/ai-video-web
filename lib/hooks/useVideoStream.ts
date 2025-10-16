/**
 * useVideoStream Hook
 *
 * Manages SSE (Server-Sent Events) connection for real-time video generation progress
 *
 * Usage:
 * ```tsx
 * const { messages, isConnected, lastMessage } = useVideoStream({
 *   videoId: 123,
 *   onComplete: (videoUrl) => console.log('Done!', videoUrl),
 *   onError: (error) => console.error('Error:', error)
 * });
 * ```
 */

import { useState, useEffect, useRef } from 'react';

export interface StreamMessage {
  step: number;
  message: string;
  video_url?: string;
  status?: string;
  error?: string;
}

interface UseVideoStreamOptions {
  videoId: number | null;
  onComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

export function useVideoStream({
  videoId,
  onComplete,
  onError
}: UseVideoStreamOptions) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Store callbacks in refs to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  useEffect(() => {
    // No video ID, don't connect
    if (!videoId) {
      return;
    }

    // Clear previous messages when starting new connection
    setMessages([]);
    setIsConnected(false);

    // Build SSE URL with authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('❌ No access token found');
      onErrorRef.current?.('Authentication required. Please login again.');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // EventSource doesn't support custom headers, so we pass token via query parameter
    const streamUrl = `${apiUrl}/videos/${videoId}/stream?token=${encodeURIComponent(token)}`;

    console.log('🔌 Connecting to SSE:', streamUrl);

    // Create EventSource connection
    const eventSource = new EventSource(streamUrl);

    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
      setIsConnected(true);
    };

    // Receive message
    eventSource.onmessage = (event) => {
      try {
        const data: StreamMessage = JSON.parse(event.data);
        console.log('📨 SSE message:', data);

        // Add to messages list
        setMessages(prev => [...prev, data]);

        // Handle completion (step 9 or video_url present)
        if (data.video_url && data.status === 'completed') {
          console.log('🎉 Video generation completed:', data.video_url);
          onCompleteRef.current?.(data.video_url);
          eventSource.close();
          setIsConnected(false);
          return;
        }

        // Handle error (step -1 or error field)
        if (data.error || data.step === -1) {
          console.error('❌ Video generation failed:', data.error || data.message);
          onErrorRef.current?.(data.error || data.message);
          eventSource.close();
          setIsConnected(false);
          return;
        }

      } catch (error) {
        console.error('❌ Failed to parse SSE message:', error);
        onErrorRef.current?.('Failed to parse server response');
      }
    };

    // Connection error
    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      setIsConnected(false);
      eventSource.close();

      // Only call onError if we haven't already completed
      if (eventSourceRef.current === eventSource) {
        onErrorRef.current?.('Connection lost. Please try refreshing the page.');
      }
    };

    // Cleanup on unmount or videoId change
    return () => {
      console.log('🔌 Closing SSE connection');
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [videoId]); // Remove onComplete and onError from dependencies

  return {
    messages,
    isConnected,
    lastMessage: messages[messages.length - 1] || null,
  };
}
