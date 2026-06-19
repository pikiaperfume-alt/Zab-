import { useEffect, useState } from 'react';

export function getConnectionState() {
  if (typeof navigator === 'undefined') {
    return { effectiveType: '4g', saveData: false, cellular: false };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) {
    return { effectiveType: '4g', saveData: false, cellular: false };
  }

  const effectiveType = connection.effectiveType || '4g';
  const saveData = Boolean(connection.saveData);
  const cellular = effectiveType.includes('2g') || effectiveType.includes('3g') || effectiveType.includes('slow-2g') || connection.type === 'cellular';
  return { effectiveType, saveData, cellular };
}

export function useNetworkStatus() {
  const [network, setNetwork] = useState(getConnectionState());

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return undefined;

    function updateStatus() {
      setNetwork(getConnectionState());
    }

    connection.addEventListener?.('change', updateStatus);
    return () => {
      connection.removeEventListener?.('change', updateStatus);
    };
  }, []);

  return network;
}
