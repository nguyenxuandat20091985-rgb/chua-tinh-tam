import { useEffect, useState } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import { getStats, subscribe } from '../lib/store';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
}

export function TempleView({ activeRitual, ritualLabel }: Props) {
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());

  useEffect(() => subscribe(() => setStats(getStats())), []);

  useEffect(() => {
    if (!activeRitual || activeRitual === 'none') return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 2500);
    return () => clearTimeout(t);
  }, [activeRitual, ritualLabel]);

  return (
    <div className="temple">
      <div className="temple-bg">
        <div className="buddha">🙏</div>
        <div className="halo" />
        <p className="temple-title">Chánh Điện Chùa Tịnh Tâm</p>
        <p className="temple-sub">LIVE · Hương {stats.incenseCount} · Công đức {stats.totalMerit}</p>

        {flash && activeRitual && (
          <div className="ritual-banner">
            <span className="ritual-emoji">{emojiFor(activeRitual)}</span>
            <span>{ritualLabel || RITUAL_LABELS[activeRitual]}</span>
          </div>
        )}

        <div className="devotees">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={`devotee ${flash ? 'bow' : ''}`}>
              🙇
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .temple {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(201, 162, 39, 0.4);
          background: linear-gradient(180deg, #2a1810 0%, #1a0e08 50%, #0d0805 100%);
          min-height: 320px;
          position: relative;
        }
        .temple-bg {
          padding: 24px 16px 16px;
          text-align: center;
          position: relative;
        }
        .buddha {
          font-size: 4rem;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.4)); }
          50% { filter: drop-shadow(0 0 28px rgba(255, 215, 0, 0.7)); }
        }
        .halo {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .temple-title {
          color: #ffd700;
          font-weight: 700;
          margin-top: 8px;
          font-size: 1.1rem;
        }
        .temple-sub {
          color: #a89060;
          font-size: 0.8rem;
          margin-top: 4px;
        }
        .ritual-banner {
          margin: 16px auto 0;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(0, 0, 0, 0.75);
          border: 1px solid #ffd700;
          border-radius: 24px;
          color: #ffd700;
          font-weight: 600;
          animation: pop 0.4s ease;
        }
        @keyframes pop {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .ritual-emoji { font-size: 1.4rem; }
        .devotees {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
          margin-top: 20px;
          opacity: 0.85;
        }
        .devotee {
          font-size: 1.2rem;
          transition: transform 0.3s;
        }
        .devotee.bow {
          animation: bow 0.6s ease;
        }
        @keyframes bow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}

function emojiFor(r: RitualId): string {
  const map: Record<string, string> = {
    go_mo: '🥁',
    thinh_chuong: '🔔',
    thap_huong: '🔥',
    tha_den: '🏮',
    xin_xam: '📜',
    dang_mam: '🍎',
    hoa_sen: '🪷',
    dai_le_kim_long: '🐉',
    song_phat_tu: '🙏',
  };
  return map[r] || '✨';
}
