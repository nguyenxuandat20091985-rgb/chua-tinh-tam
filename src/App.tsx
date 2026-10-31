import { useState } from 'react';
import { VirtualTour360 } from './components/VirtualTour360';

/**
 * Demo page – Chùa Tịnh Tâm Tour 360°
 * Dùng ảnh panorama mẫu (equirectangular) để xem ngay.
 * Anh có thể đổi panoramaUrl thành link video/ảnh 360 của chùa.
 */
export default function App() {
  const [showTour, setShowTour] = useState(true);

  // Ảnh panorama mẫu (equirectangular) – có thể thay bằng link của anh
  const DEMO_PANO =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a1208 0%, #0f0a05 100%)' }}>
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', color: '#ffd700', margin: 0 }}>
            🙏 Chùa Tịnh Tâm
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#a89060', margin: '4px 0 0' }}>
            Tour 360° – VirtualTour360
          </p>
        </div>
        <button
          onClick={() => setShowTour((v) => !v)}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #c9a227, #e8c547)',
            border: 'none',
            borderRadius: 8,
            color: '#1a1208',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showTour ? 'Ẩn Tour' : 'Xem Tour 360°'}
        </button>
      </header>

      {/* Main */}
      <main style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>
        {showTour ? (
          <VirtualTour360
            panoramaUrl={DEMO_PANO}
            title="Chánh điện Chùa Tịnh Tâm"
            description="Kéo hoặc vuốt để nhìn quanh không gian 360°. Thay panoramaUrl bằng ảnh/video 360 của chùa."
            onClose={() => setShowTour(false)}
          />
        ) : (
          <div
            style={{
              height: '50vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed rgba(201,162,39,0.4)',
              borderRadius: 12,
              color: '#a89060',
            }}
          >
            Nhấn "Xem Tour 360°" để mở trải nghiệm
          </div>
        )}

        <section style={{ marginTop: 24, padding: 16, background: 'rgba(40,25,10,0.6)', borderRadius: 12 }}>
          <h2 style={{ color: '#ffd700', fontSize: '1rem', marginBottom: 8 }}>Hướng dẫn</h2>
          <ul style={{ color: '#e8d5a3', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: 18 }}>
            <li>Kéo chuột (hoặc vuốt điện thoại) để xoay góc nhìn 360°</li>
            <li>Dùng thanh điều khiển phía dưới: Phát / Tắt tiếng / Reset / Toàn màn hình</li>
            <li>Thay <code style={{ color: '#ffd700' }}>panoramaUrl</code> trong <code>App.tsx</code> bằng link ảnh hoặc video 360° của chùa</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
