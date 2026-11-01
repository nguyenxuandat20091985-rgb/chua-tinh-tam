import { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { TempleView } from './components/TempleView';
import { VirtualTour360 } from './components/VirtualTour360';
import type { RitualId } from './lib/rules';

const DEMO_PANO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg';

export default function App() {
  const [tab, setTab] = useState<'live' | 'tour360'>('live');
  const [activeRitual, setActiveRitual] = useState<RitualId | null>(null);
  const [ritualLabel, setRitualLabel] = useState('');

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🙏 Chùa Tịnh Tâm</h1>
          <p>Hệ thống Live · Quy tắc tương tác · Công đức · Tour 360°</p>
        </div>
        <nav className="tabs">
          <button
            type="button"
            className={tab === 'live' ? 'active' : ''}
            onClick={() => setTab('live')}
          >
            Live & Điều khiển
          </button>
          <button
            type="button"
            className={tab === 'tour360' ? 'active' : ''}
            onClick={() => setTab('tour360')}
          >
            Tour 360°
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'live' && (
          <>
            <TempleView activeRitual={activeRitual} ritualLabel={ritualLabel} />
            <div style={{ marginTop: 20 }}>
              <ControlPanel
                onRitual={(ritual, label) => {
                  setActiveRitual(ritual);
                  setRitualLabel(label);
                }}
              />
            </div>
          </>
        )}

        {tab === 'tour360' && (
          <VirtualTour360
            panoramaUrl={DEMO_PANO}
            title="Chánh điện Chùa Tịnh Tâm – 360°"
            description="Kéo / vuốt để nhìn quanh. Thay panoramaUrl bằng ảnh hoặc video 360 của chùa."
          />
        )}
      </main>

      <footer className="footer">
        Chùa Tịnh Tâm · Bảng quy tắc TikTok Live · Công đức realtime
      </footer>

      <style>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(165deg, #1a1208 0%, #0f0a05 45%, #0a0806 100%);
          color: #f5e6c8;
        }
        .header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.3);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .header h1 {
          font-size: 1.35rem;
          color: #ffd700;
          margin: 0;
        }
        .header p {
          font-size: 0.8rem;
          color: #a89060;
          margin: 4px 0 0;
        }
        .tabs {
          display: flex;
          gap: 8px;
        }
        .tabs button {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #5c4033;
          background: #1a1008;
          color: #c9a227;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .tabs button.active {
          background: linear-gradient(135deg, #c9a227, #e8c547);
          color: #1a1008;
          border-color: transparent;
        }
        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 16px 40px;
        }
        .footer {
          text-align: center;
          padding: 16px;
          font-size: 0.75rem;
          color: #6b5344;
          border-top: 1px solid rgba(201, 162, 39, 0.15);
        }
      `}</style>
    </div>
  );
}
