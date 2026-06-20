import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useAuth } from '../lib/AuthContext';

function VideoTile({ stream, label, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: '#0f1023', minHeight: 260 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(5,7,22,0.72)', fontSize: 12, color: 'var(--ink-100)' }}>
        {label}
      </div>
    </div>
  );
}

export default function LiveSession({ onNavigate }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('host');
  const [sessionCode, setSessionCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionCode && user?.uid) {
      const suggested = `zab-${user.uid.slice(0, 10)}-${Math.random().toString(36).slice(2, 7)}`;
      setSessionCode(suggested);
    } else if (!sessionCode) {
      const suggested = `zab-room-${Math.random().toString(36).slice(2, 9)}`;
      setSessionCode(suggested);
    }
  }, [sessionCode, user]);

  function sanitizeCode(value) {
    return (value || '').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 40);
  }

  function syncMediaControls(stream) {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    if (audioTrack) setMicEnabled(audioTrack.enabled);
    if (videoTrack) setCameraEnabled(videoTrack.enabled);
  }

  function toggleMic() {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicEnabled(audioTrack.enabled);
  }

  function toggleCamera() {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCameraEnabled(videoTrack.enabled);
  }

  function addParticipant(peerId, stream) {
    setParticipants((prev) => {
      if (prev.some((participant) => participant.id === peerId)) return prev;
      return [...prev, { id: peerId, stream }];
    });
  }

  function removeParticipant(peerId) {
    setParticipants((prev) => prev.filter((participant) => participant.id !== peerId));
  }

  async function requestMedia() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support camera and microphone access.');
    }

    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    });
  }

  function attachPeerHandlers(peer, stream) {
    peer.on('open', () => {
      if (!mountedRef.current) return;
      setIsReady(true);
      setError('');
    });

    peer.on('call', (call) => {
      if (!stream) return;
      call.answer(stream);
      call.on('stream', (remoteStream) => {
        addParticipant(call.peer, remoteStream);
      });
      call.on('close', () => removeParticipant(call.peer));
      call.on('error', () => removeParticipant(call.peer));
    });

    peer.on('error', (err) => {
      if (!mountedRef.current) return;
      setError(err?.message || 'Could not connect to the live room.');
      setIsConnecting(false);
    });
  }

  async function startHostSession() {
    const code = sanitizeCode(sessionCode);
    if (!code) {
      setError('Please choose a room code before starting.');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');
      setParticipants([]);
      const stream = await requestMedia();
      if (!mountedRef.current) return;
      localStreamRef.current = stream;
      setLocalStream(stream);
      syncMediaControls(stream);

      const peer = new Peer(code, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        debug: 0,
      });
      peerRef.current = peer;
      attachPeerHandlers(peer, stream);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Unable to start the room.');
      setIsConnecting(false);
    }
  }

  async function joinSession() {
    const code = sanitizeCode(sessionCode);
    if (!code) {
      setError('Please enter the host room code.');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');
      setParticipants([]);
      const stream = await requestMedia();
      if (!mountedRef.current) return;
      localStreamRef.current = stream;
      setLocalStream(stream);
      syncMediaControls(stream);

      const peer = new Peer(`zab-guest-${Math.random().toString(36).slice(2, 9)}`, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        debug: 0,
      });
      peerRef.current = peer;

      peer.on('open', () => {
        if (!mountedRef.current) return;
        const call = peer.call(code, stream);
        call.on('stream', (remoteStream) => {
          addParticipant(code, remoteStream);
        });
        call.on('close', () => removeParticipant(code));
        call.on('error', () => removeParticipant(code));
        setIsReady(true);
        setError('');
      });

      peer.on('error', (err) => {
        if (!mountedRef.current) return;
        setError(err?.message || 'Unable to join the room.');
        setIsConnecting(false);
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Unable to access the microphone or camera.');
      setIsConnecting(false);
    }
  }

  function stopSession() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setIsReady(false);
    setIsConnecting(false);
    setParticipants([]);
    setMicEnabled(true);
    setCameraEnabled(true);
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <button className="btn-secondary" onClick={() => onNavigate('dashboard')} style={{ marginBottom: 18 }}>
        ← Back to dashboard
      </button>
      <p className="eyebrow" style={{ marginBottom: 10 }}>LIVE ROOM</p>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Host audio + video without Zoom</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-200)', maxWidth: 640, marginBottom: 24, lineHeight: 1.6 }}>
        Use this space for a direct host-to-participant live session. The room runs peer-to-peer here and is not saved to the backend.
      </p>

      <div className="glass-card" style={{ padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button className={mode === 'host' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('host')}>Host</button>
          <button className={mode === 'join' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('join')}>Join</button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <input
            value={sessionCode}
            onChange={(e) => setSessionCode(sanitizeCode(e.target.value))}
            placeholder={mode === 'host' ? 'Choose a room code' : 'Enter the host room code'}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(245,243,255,0.12)',
              background: 'rgba(245,243,255,0.04)',
              color: 'var(--ink-100)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {mode === 'host' ? (
            <button className="btn-primary" disabled={isConnecting} onClick={startHostSession}>
              {isConnecting ? 'Starting room…' : 'Start live room'}
            </button>
          ) : (
            <button className="btn-primary" disabled={isConnecting} onClick={joinSession}>
              {isConnecting ? 'Connecting…' : 'Join room'}
            </button>
          )}
          {isReady && (
            <>
              <button className="btn-secondary" onClick={toggleMic}>
                {micEnabled ? 'Mute mic' : 'Unmute mic'}
              </button>
              <button className="btn-secondary" onClick={toggleCamera}>
                {cameraEnabled ? 'Stop camera' : 'Start camera'}
              </button>
              <button className="btn-secondary" onClick={stopSession}>Leave room</button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(220,38,38,0.12)', color: '#fecaca', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {isReady && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: localStream ? '1.2fr 1fr' : '1fr', gap: 16 }}>
            {localStream && <VideoTile stream={localStream} label={mode === 'host' ? 'You (host)' : 'You'} muted />}
            {participants.length > 0 && participants.map((participant) => (
              <VideoTile key={participant.id} stream={participant.stream} label={participant.id} />
            ))}
          </div>
        </div>
      )}

      {!isReady && !isConnecting && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>
            {mode === 'host'
              ? 'Start a room to share your camera and microphone with attendees.'
              : 'Join with the host room code to enter the live session.'}
          </p>
        </div>
      )}
    </div>
  );
}
