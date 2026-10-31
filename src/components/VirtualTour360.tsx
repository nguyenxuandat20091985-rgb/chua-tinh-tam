import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, ChevronUp, X } from 'lucide-react';

/**
 * VirtualTour360 – Clean 360° viewer for Chùa Tịnh Tâm
 * - Loads A-Frame dynamically
 * - Reads panorama/video URL (from Supabase or static)
 * - Mobile-first bottom sheet controls
 * - TypeScript + Clean Code
 */

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
  /** URL of 360° video or equirectangular image */
  panoramaUrl: string;
  /** Display title */
  title?: string;
  /** Optional description shown in sheet */
  description?: string;
  /** Called when user closes the viewer */
  onClose?: () => void;
  /** Height class (default 70vh / 80vh on desktop) */
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

  // 1. Load A-Frame script once
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

  // 2. Build / rebuild the A-Frame scene when ready + URL changes
  useEffect(() => {
    if (!aframeReady || !containerRef.current || !panoramaUrl) return;

    setLoading(true);
    setError(null);

    const isVideo = /\.(mp4|webm|mkv|mov|ogg)(\?|$)/i.test(panoramaUrl);

    const sceneHtml = isVideo
      ? `
        <a-scene
          embedded
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          style="width:100%;height:100%;border-radius:12px"
          renderer="antialias: true; colorManagement: true"
          background="color: #000"
        >
          <a-assets timeout="15000">
            <video
              id="pano-media"
              src="${panoramaUrl}"
              loop
              autoplay
              muted
              playsinline
              crossorigin="anonymous"
              preload="auto"
            ></video>
          </a-assets>
          <a-videosphere
            src="#pano-media"
            rotation="0 -90 0"
            radius="100"
          ></a-videosphere>
          <a-camera
            look-controls="enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true"
            wasd-controls="enabled: false"
            position="0 1.6 0"
            fov="80"
          ></a-camera>
        </a-scene>
      `
      : `
        <a-scene
          embedded
          vr-mode-ui="enabled: false"
          style="width:100%;height:100%;border-radius:12px"
          background="color: #000"
        >
          <a-sky src="${panoramaUrl}" rotation="0 -90 0"></a-sky>
          <a-camera
            look-controls="enabled: true; touchEnabled: true"
            wasd-controls="enabled: false"
            position="0 1.6 0"
            fov="80"
          ></a-camera>
        </a-scene>
      `;

    containerRef.current.innerHTML = sceneHtml;

    const video = containerRef.current.querySelector('#pano-media') as HTMLVideoElement | null;
    if (video) {
      videoRef.current = video;

      const onCanPlay = () => {
        setLoading(false);
        video.play().catch(() => setPlaying(false));
      };
      const onError = () => {
        setLoading(false);
        setError('Không tải được video 360°. Kiểm tra đường dẫn.');
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.addEventListener('play', () => setPlaying(true));
      video.addEventListener('pause', () => setPlaying(false));

      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
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
      className={`relative w-full overflow-hidden rounded-xl bg-black ${
        className || 'h-[70vh] md:h-[80vh]'
      }`}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="w-12 h-12 mb-4 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
          <p className="text-white text-sm">Đang tải trải nghiệm 360°...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 text-sm text-white bg-black/70 backdrop-blur rounded-lg">
          {title}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-white bg-black/70 backdrop-blur rounded-lg hover:bg-black/90"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!loading && !error && (
        <div className="absolute top-3 right-3 z-20 hidden px-3 py-1.5 text-xs text-white/80 bg-black/60 rounded-lg sm:block">
          Kéo để nhìn quanh • Vuốt trên điện thoại
        </div>
      )}

      {/* Mobile Bottom Sheet Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <button
          onClick={() => setSheetOpen((o) => !o)}
          className="flex items-center justify-center w-full py-2 text-white bg-black/60 backdrop-blur"
          aria-label="Mở/đóng điều khiển"
        >
          <ChevronUp
            size={20}
            className={`transition-transform duration-200 ${sheetOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {sheetOpen && (
          <div className="px-4 pt-2 pb-5 bg-black/85 backdrop-blur-md">
            {description && (
              <p className="mb-3 text-xs text-center text-white/70 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <ControlButton onClick={togglePlay} label={playing ? 'Tạm dừng' : 'Phát'}>
                {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </ControlButton>

              <ControlButton onClick={toggleMute} label={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </ControlButton>

              <ControlButton onClick={resetView} label="Đặt lại góc nhìn">
                <RotateCcw size={18} />
              </ControlButton>

              <ControlButton onClick={enterFullscreen} label="Toàn màn hình">
                <Maximize2 size={18} />
              </ControlButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlButton({
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
      className="flex items-center justify-center w-12 h-12 text-white transition-colors rounded-full bg-white/15 hover:bg-amber-600 active:scale-95"
    >
      {children}
    </button>
  );
}

export default VirtualTour360;
