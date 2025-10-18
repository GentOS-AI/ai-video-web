import { useState, useEffect } from 'react';

export type NetworkSpeed = 'fast' | 'slow' | 'offline' | 'unknown';

interface NetworkInformation extends EventTarget {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Custom hook to detect network speed
 * Returns 'fast', 'slow', 'offline', or 'unknown'
 */
export const useNetworkSpeed = (): NetworkSpeed => {
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>('unknown');

  useEffect(() => {
    // Check if browser supports Network Information API
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkSpeed = () => {
      // Check online status first
      if (!navigator.onLine) {
        setNetworkSpeed('offline');
        return;
      }

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const saveData = connection.saveData;

        // If user has enabled data saver mode, treat as slow
        if (saveData) {
          setNetworkSpeed('slow');
          return;
        }

        // Check effective connection type
        if (effectiveType === '4g' || (downlink && downlink > 5)) {
          setNetworkSpeed('fast');
        } else if (effectiveType === '3g' || (downlink && downlink > 1.5)) {
          setNetworkSpeed('fast'); // 3G is acceptable for video autoplay
        } else {
          setNetworkSpeed('slow'); // 2G or slow-2G
        }
      } else {
        // Fallback: assume fast if we can't detect
        // This is safer for desktop browsers without the API
        setNetworkSpeed('fast');
      }
    };

    updateNetworkSpeed();

    // Listen for connection changes
    if (connection) {
      connection.addEventListener('change', updateNetworkSpeed);
    }

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkSpeed);
    window.addEventListener('offline', updateNetworkSpeed);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkSpeed);
      }
      window.removeEventListener('online', updateNetworkSpeed);
      window.removeEventListener('offline', updateNetworkSpeed);
    };
  }, []);

  return networkSpeed;
};
