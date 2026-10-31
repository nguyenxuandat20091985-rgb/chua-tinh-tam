import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, ChevronUp, X } from 'lucide-react';

declare global {
  interface Window {
    AFRAME?: any;
  }
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-videosphere': any;
      'a-assets': any;
      'a-camera': any;
      'a-sky': any;
    }
  }
}

export interface VirtualTour360Props {
  panoramaUrl: string;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function VirtualTour360({
  panoramaUrl,
  title = 'Tour 360° Chùa Tịnh Tâm',
  description,
  onClose,
  className = '',
}: VirtualTour360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aframeReady, setAframeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.AFRAME) {
      setAframeReady(true);
      return;
    }
    const existing = document.getElementById('aframe-script');
    if (existing) {
      existing.addEventListener('load', () => setAframeReady(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'aframe-script';
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.async = true;
    script.onload = () => setAframeReady(true);
    script.onerror = () => {
      const fallback = document.createElement('script');
      fallback.src = 'https://cdn.jsdelivr.net/npm/aframe@1.4.0/dist/aframe.min.js';
      fallback.onload = () => setAframeReady(true);
      fallback.onerror = () => setError('Không tải được A-Frame. Kiểm tra kết nối mạng.');
      document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!aframeReady || !containerRef.current || !panoramaUrl) return;
    setLoading(true);
    setError(null);

    const isVideo = /\.(mp4|webm|mkv|mov|ogg)(\?|$)/i.test(panoramaUrl);

    const sceneHtml = isVideo
      ? `
        <a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
          style="width:100%;height:100%;border-radius:12px"
          renderer="antialias: true; colorManagement: true" background="color: #000">
          <a-assets timeout="15000">
            <video id="pano-media" src="${panoramaUrl}" loop autoplay muted playsinline crossorigin="anonymous" preload="auto"></video>
          </a-assets>
          <a-videosphere src="#pano-media" rotation="0 -90 0" radius="100"></a-videosphere>
          <a-camera look-controls="enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true"
            wasd-controls="enabled: false" position="0 1.6 0" fov="80"></a-camera>
        </a-scene>`
      : `
        <a-scene embedded vr-mode-ui="enabled: false"
          style="width:100%;height:100%;border-radius:12px" background="color: #000">
          <a-sky src="${panoramaUrl}" rotation="0 -90 0"></a-sky>
          <a-camera look-controls="enabled: true; touchEnabled: true"
            wasd-controls="enabled: false" position="0 1.6 0" fov="80"></a-camera>
        </a-scene>`;

    containerRef.current.innerHTML = sceneHtml;

    const video = containerRef.current.querySelector('#pano-media') as HTMLVideoElement | null;
    if (video) {
      videoRef.current = video;
      const onCanPlay = () => {
        setLoading(false);
        video.play().catch(() => setPlaying(false));
      };
      const onErr = () => {
        setLoading(false);
        setError('Không tải được video 360°. Kiểm tra đường dẫn.');
      };
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onErr);
      video.addEventListener('play', () => setPlaying(true));
      video.addEventListener('pause', () => setPlaying(false));
      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onErr);
        video.pause();
        video.src = '';
        video.load();
      };
    } else {
      const t = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(t);
    }
  }, [aframeReady, panoramaUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play().catch(console.error);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const resetView = () => {
    const cam = containerRef.current?.querySelector('a-camera');
    if (cam) cam.setAttribute('rotation', '0 0 0');
  };

  const enterFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: className ? undefined : '70vh',
        overflow: 'hidden',
        borderRadius: 12,
        background: '#000',
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {loading && !error && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#fff', fontSize: 14 }}>Đang tải trải nghiệm 360°...</p>
        </div>
      )}

      {error && (
        <div style={overlayStyle}>
          <p style={{ color: '#f87171', marginBottom: 12 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={btnStyle}>
            Thử lại
          </button>
        </div>
      )}

      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 20, display: 'flex', gap: 8 }}>
        <div style={badgeStyle}>{title}</div>
        {onClose && (
          <button onClick={onClose} style={{ ...badgeStyle, padding: '6px 8px', cursor: 'pointer' }} aria-label="Đóng">
            <X size={16} />
          </button>
        )}
      </div>

      {!loading && !error && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, ...badgeStyle, fontSize: 12, opacity: 0.85 }}>
          Kéo để nhìn quanh • Vuốt trên điện thoại
        </div>
      )}

      {/* Bottom sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        <button
          onClick={() => setSheetOpen((o) => !o)}
          style={{
            width: '100%',
            padding: '8px 0',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ChevronUp size={20} style={{ transform: sheetOpen ? 'rotate(180deg)' : undefined, transition: '0.2s' }} />
        </button>

        {sheetOpen && (
          <div style={{ padding: '8px 16px 20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            {description && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 12 }}>
                {description}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Ctrl onClick={togglePlay} label={playing ? 'Tạm dừng' : 'Phát'}>
                {playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
              </Ctrl>
              <Ctrl onClick={toggleMute} label={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </Ctrl>
              <Ctrl onClick={resetView} label="Đặt lại">
                <RotateCcw size={18} />
              </Ctrl>
              <Ctrl onClick={enterFullscreen} label="Toàn màn hình">
                <Maximize2 size={18} />
              </Ctrl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Ctrl({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,0.15)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.85)',
};

const spinnerStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  marginBottom: 16,
  border: '4px solid #c9a227',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const badgeStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 14,
  color: '#fff',
  background: 'rgba(0,0,0,0.7)',
  borderRadius: 8,
  backdropFilter: 'blur(4px)',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  color: '#fff',
  background: '#c9a227',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};

export default VirtualTour360;
