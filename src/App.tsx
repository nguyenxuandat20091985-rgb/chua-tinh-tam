import { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { TempleView } from './components/TempleView';
import { VirtualTour360 } from './components/VirtualTour360';
import type { RitualId } from './lib/rules';

const DEMO_PANO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg';
const TEMPLE_PANORAMA_URL = import.meta.env.VITE_TEMPLE_PANORAMA_URL || DEMO_PANO;

export default function App() {
  const [tab, setTab] = useState<'live' | 'tour360'>('live');
  const [activeRitual, setActiveRitual] = useState<RitualId | null>(null);
  const [ritualLabel, setRitualLabel] = useState('');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended'>('idle');
  const [panelExpanded, setPanelExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth > 900);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="lotus">🪷</span>
          <div>
            <h1>Chùa Tịnh Tâm</h1>
            <p>TikTok Live · Nghi thức · Công đức</p>
          </div>
        </div>
        <nav className="tabs">
          <button
            type="button"
            className={tab === 'live' ? 'on' : ''}
            onClick={() => setTab('live')}
          >
            Live & Điều khiển
          </button>
          <button
            type="button"
            className={tab === 'tour360' ? 'on' : ''}
            onClick={() => setTab('tour360')}
          >
            Tour 360°
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'live' && (
          <div className="live-layout">
            <div className="col-temple">
              <TempleView activeRitual={activeRitual} ritualLabel={ritualLabel} liveStatus={liveStatus} />
            </div>
            <div className="col-panel">
              <details className="control-drawer" open={panelExpanded} onToggle={(event) => setPanelExpanded(event.currentTarget.open)}>
                <summary>⚙️ Bảng điều khiển LIVE <span>{panelExpanded ? 'Thu gọn' : 'Mở điều khiển'}</span></summary>
                <ControlPanel
                onLiveStatus={setLiveStatus}
                onRitual={(ritual, label) => {
                  setActiveRitual(ritual);
                  setRitualLabel(label);
                }}
                />
              </details>
            </div>
          </div>
        )}

        {tab === 'tour360' && (
          <div className="tour-wrap">
            <VirtualTour360
              panoramaUrl={TEMPLE_PANORAMA_URL}
              title="Chánh điện Chùa Tịnh Tâm – 360°"
              description="Kéo / vuốt để nhìn quanh. Thay panoramaUrl bằng ảnh/video 360 của chùa."
            />
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        .app {
          min-height: 100vh;
          background: #0c0806;
          color: #f5e6c8;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 18px;
          background: linear-gradient(90deg, #1a120a, #120c08);
          border-bottom: 1px solid rgba(201, 162, 39, 0.35);
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .lotus { font-size: 1.6rem; }
        .brand h1 {
          margin: 0;
          font-size: 1.2rem;
          color: #ffd700;
          letter-spacing: 0.02em;
        }
        .brand p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: #a89060;
        }
        .tabs { display: flex; gap: 8px; }
        .tabs button {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #5c4033;
          background: #1a1008;
          color: #c9a227;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
        }
        .tabs button.on {
          background: linear-gradient(135deg, #c9a227, #e8c547);
          color: #1a1008;
          border-color: transparent;
        }
        .main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 12px 28px;
        }
        .live-layout {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) minmax(300px, 380px);
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .live-layout { grid-template-columns: minmax(0, 1fr); }
          .main { padding: 8px 8px 22px; }
          .col-panel { max-height: none; overflow: visible; }
        }
        .col-temple {
          min-height: 520px;
        }
        .col-panel { max-height: calc(100vh - 80px); overflow-y: auto; }
        .control-drawer { border: 1px solid rgba(201,162,39,.35); border-radius: 12px; background: #120c08; overflow: hidden; }
        .control-drawer > summary { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; color:#ffdc86; font-weight:700; cursor:pointer; list-style:none; background:linear-gradient(90deg,#2b190d,#170e08); }
        .control-drawer > summary::-webkit-details-marker { display:none; }
        .control-drawer > summary span { font-size:.75rem; color:#c9a66a; font-weight:500; }
        .control-drawer[open] > summary { border-bottom:1px solid rgba(201,162,39,.25); }
        .control-drawer > .cp { padding:12px; }
        .tour-wrap { max-width: 960px; margin: 0 auto; }
      `}</style>
    </div>
  );
}
