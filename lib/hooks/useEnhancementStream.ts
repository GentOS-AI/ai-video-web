/**
 * useEnhancementStream Hook
 *
 * Manages SSE (Server-Sent Events) connection for real-time image enhancement progress
 *
 * Usage:
 * ```tsx
 * const { messages, isConnected, lastMessage, progress } = useEnhancementStream({
 *   taskId: 123,
 *   onComplete: (result) => console.log('Done!', result),
 *   onError: (error) => console.error('Error:', error)
 * });
 * ```
 */

import { useState, useEffect, useRef } from 'react';

export interface EnhancementStreamMessage {
  progress: number;
  message: string;
  enhanced_image_url?: string;
  script?: string;
  product_analysis?: string;
  status?: string;
  error?: string;
  timestamp?: number;
}

export interface EnhancementResult {
  enhanced_image_url: string;
  script: string;
  product_analysis?: string;
}

interface UseEnhancementStreamOptions {
  taskId: number | null;
  onComplete?: (result: EnhancementResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number, message: string) => void;
}

export function useEnhancementStream({
  taskId,
  onComplete,
  onError,
  onProgress
}: UseEnhancementStreamOptions) {
  const [messages, setMessages] = useState<EnhancementStreamMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Store callbacks in refs to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onProgressRef = useRef(onProgress);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
    onProgressRef.current = onProgress;
  }, [onComplete, onError, onProgress]);

  useEffect(() => {
    // No task ID, don't connect
    if (!taskId) {
      return;
    }

    // Clear previous messages when starting new connection
    setMessages([]);
    setIsConnected(false);
    setProgress(0);

    // Build SSE URL with authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('❌ [Enhancement SSE] No access token found');
      onErrorRef.current?.('Authentication required. Please login again.');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // EventSource doesn't support custom headers, so we pass token via query parameter
    const streamUrl = `${apiUrl}/ai/enhance-and-script/${taskId}/stream?token=${encodeURIComponent(token)}`;

    console.log('🔌 [Enhancement SSE] Connecting to:', streamUrl);

    // Create EventSource connection
    const eventSource = new EventSource(streamUrl);

    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('✅ [Enhancement SSE] Connection opened');
      setIsConnected(true);
    };

    // Receive message
    eventSource.onmessage = (event) => {
      try {
        const data: EnhancementStreamMessage = JSON.parse(event.data);
        console.log('📨 [Enhancement SSE] Message:', data);

        // Add to messages list
        setMessages(prev => [...prev, data]);

        // Update progress
        if (typeof data.progress === 'number') {
          setProgress(data.progress);
          onProgressRef.current?.(data.progress, data.message);
        }

        // Handle completion (progress 100 or status="completed")
        if (data.status === 'completed' || data.progress === 100) {
          console.log('🎉 [Enhancement SSE] Task completed');

          if (data.enhanced_image_url && data.script) {
            onCompleteRef.current?.({
              enhanced_image_url: data.enhanced_image_url,
              script: data.script,
              product_analysis: data.product_analysis
            });
          }

          eventSource.close();
          setIsConnected(false);
          return;
        }

        // Handle error (progress -1 or error field)
        if (data.error || data.progress === -1 || data.status === 'failed') {
          console.error('❌ [Enhancement SSE] Task failed:', data.error || data.message);
          onErrorRef.current?.(data.error || data.message || 'Enhancement failed');
          eventSource.close();
          setIsConnected(false);
          return;
        }

      } catch (error) {
        console.error('❌ [Enhancement SSE] Failed to parse message:', error);
        onErrorRef.current?.('Failed to parse server response');
      }
    };

    // Connection error
    eventSource.onerror = (error) => {
      console.error('❌ [Enhancement SSE] Connection error:', error);
      setIsConnected(false);
      eventSource.close();

      // Only call onError if we haven't already completed
      if (eventSourceRef.current === eventSource) {
        onErrorRef.current?.('Connection lost. Please try refreshing the page.');
      }
    };

    // Cleanup on unmount or taskId change
    return () => {
      console.log('🔌 [Enhancement SSE] Closing connection');
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [taskId]); // Remove callbacks from dependencies

  return {
    messages,
    isConnected,
    lastMessage: messages[messages.length - 1] || null,
    progress,
  };
}
