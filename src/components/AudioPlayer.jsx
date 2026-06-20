import { useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '../lib/network';
import { resolveMediaUrl } from '../lib/storage';

export default function AudioPlayer({ session }) {
  const audioRef = useRef(null);
  const [isCached, setIsCached] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('checking');
  const [audioSrc, setAudioSrc] = useState('');
  const [error, setError] = useState('');
  const network = useNetworkStatus();
  const lowDataMode = network.saveData || network.cellular;
  const disableCacheWrite = lowDataMode && !isCached;

  const mediaUrl = resolveMediaUrl(session?.audioUrl || session?.mediaUrl || session?.url);

  useEffect(() => {
    let objectUrl;
    const cacheName = 'zab-audio-cache';

    async function initCache() {
      if (!('caches' in window)) {
        setCacheStatus('unsupported');
        return;
      }

      try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(mediaUrl);
        if (response) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setAudioSrc(objectUrl);
          setIsCached(true);
        }
        setCacheStatus('ready');
      } catch (err) {
        console.error('Audio cache error', err);
        setCacheStatus('error');
      }
    }

    if (!mediaUrl) {
      setCacheStatus('ready');
      return;
    }

    initCache();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaUrl]);

  async function handleToggleCache() {
    if (lowDataMode && !isCached) {
      setError('Offline caching is disabled in low data mode to conserve mobile data.');
      return;
    }

    if (!('caches' in window)) {
      setError('Browser cache API not supported.');
      return;
    }

    setError('');
    const cacheName = 'zab-audio-cache';

    if (!mediaUrl) {
      setError('No audio source is available yet.');
      return;
    }

    try {
      const cache = await caches.open(cacheName);
      if (isCached) {
        await cache.delete(mediaUrl);
        setIsCached(false);
        setAudioSrc(mediaUrl);
      } else {
        await cache.add(mediaUrl);
        const response = await cache.match(mediaUrl);
        if (response) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setAudioSrc(objectUrl);
          setIsCached(true);
        }
      }
    } catch (err) {
      console.error('Audio cache toggle error', err);
      setError('Unable to cache audio for offline playback.');
    }
  }

  function handlePlay() {
    setError('');
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error('Audio play failed', err);
        setError('Unable to play audio.');
      });
    }
  }

  return (
    <div style={{ marginTop: 24, padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--ink-400)', marginBottom: 8 }}>Now playing</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{session.title}</div>
          <div style={{ color: 'var(--ink-400)', marginTop: 6 }}>{session.type} · {session.duration}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePlay}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--gradient-aurora)',
              color: '#111827',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Play
          </button>
          <button
            type="button"
            onClick={handleToggleCache}
            disabled={disableCacheWrite}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(245,243,255,0.12)',
              background: disableCacheWrite ? 'rgba(245,243,255,0.02)' : 'transparent',
              color: disableCacheWrite ? 'var(--ink-500)' : 'var(--ink-100)',
              cursor: disableCacheWrite ? 'not-allowed' : 'pointer',
            }}
          >
            {isCached ? 'Remove offline' : 'Save offline'}
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc || mediaUrl}
        preload="none"
        controls
        style={{ width: '100%', borderRadius: 16, outline: 'none' }}
      />

      {lowDataMode && (
        <div style={{ marginTop: 12, color: 'var(--ink-300)', fontSize: 13 }}>
          Low data mode is active: audio playback only begins after you press play, and offline caching is disabled while you are on cellular or data saver.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--ink-400)', fontSize: 13 }}>
          {isCached ? 'Offline available' : 'Streaming only'}
        </span>
        <span style={{ color: 'var(--ink-400)', fontSize: 13 }}>
          Cache status: {cacheStatus}
        </span>
      </div>

      {error && (
        <div style={{ marginTop: 14, color: '#F08AA8', fontSize: 13 }}>{error}</div>
      )}
    </div>
  );
}
