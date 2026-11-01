import { useEffect, useState } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import { getStats, getTopRanking, subscribe } from '../lib/store';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
}

const SAMPLE_NAMES = [
  'Tiến Trưởng', 'Anh Thơ', 'Nguyễn', 'Lương', 'Tuấn',
  'Minh', 'Hạnh', 'Lan', 'Quỳnh', 'Hùng',
  'Mai', 'Đức', 'Phúc', 'An', 'Tâm',
];

export function TempleView({ activeRitual, ritualLabel }: Props) {
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(5));

  useEffect(() => {
    return subscribe(() => {
      setStats(getStats());
      setRanking(getTopRanking(5));
    });
  }, []);

  useEffect(() => {
    if (!activeRitual || activeRitual === 'none') return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 2800);
    return () => clearTimeout(t);
  }, [activeRitual, ritualLabel]);

  return (
    <div className="tv">
      {/* Phone-frame style temple */}
      <div className={`hall ${flash ? 'ritual-on' : ''}`}>
        {/* Top status */}
        <div className="hall-top">
          <span className="live-badge">LIVE</span>
          <span className="hall-stats">
            🔥 {stats.incenseCount} hương · ⭐ {stats.totalMerit} CD
          </span>
        </div>

        {/* Golden Buddha zone */}
        <div className="altar">
          <div className="rays" />
          <div className="buddha-wrap">
            <div className="buddha">Buddha</div>
            <div className="lotus-throne" />
          </div>
          {flash && activeRitual && (
            <div className="ritual-pop">
              <span>{emojiFor(activeRitual)}</span>
              <strong>{ritualLabel || RITUAL_LABELS[activeRitual]}</strong>
            </div>
          )}
        </div>

        {/* Red carpet + devotees */}
        <div className="nave">
          <div className="carpet" />
          <div className="crowd">
            {SAMPLE_NAMES.map((name, i) => (
              <div
                key={name + i}
                className={`person ${flash ? 'bow' : ''}`}
                style={{ animationDelay: `${(i % 6) * 0.05}s` }}
              >
                <span className="tag">{name}</span>
                <span className="body">🙇</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hall-bottom">
          <div className="offer-btns">
            <span>🔥 Dâng hương</span>
            <span>🙏 Cầu phúc</span>
            <span>🪷 Hoa sen</span>
          </div>
          <div className="mini-rank">
            <div className="mini-title">TẤM LÒNG THÀNH</div>
            {ranking.length === 0 && <div className="muted">—</div>}
            {ranking.map((r, i) => (
              <div key={r.name} className="mini-row">
                <span>{i + 1}. {r.name}</span>
                <span>{r.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tv { width: 100%; }
        .hall {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(201, 162, 39, 0.45);
          background:
            radial-gradient(ellipse at 50% 18%, rgba(255, 200, 60, 0.22) 0%, transparent 45%),
            linear-gradient(180deg, #3d2410 0%, #1a0e08 40%, #0d0805 100%);
          min-height: 560px;
          box-shadow: 0 0 40px rgba(201, 162, 39, 0.12);
        }
        .hall.ritual-on {
          box-shadow: 0 0 50px rgba(255, 215, 0, 0.35);
        }
        .hall-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(0,0,0,0.35);
        }
        .live-badge {
          background: #e11d48;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.06em;
        }
        .hall-stats {
          font-size: 0.78rem;
          color: #ffd700;
        }
        .altar {
          position: relative;
          padding: 20px 12px 8px;
          text-align: center;
        }
        .rays {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 65%);
          pointer-events: none;
        }
        .buddha-wrap { position: relative; z-index: 1; }
        .buddha {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 110px; height: 110px;
          border-radius: 50%;
          background: linear-gradient(160deg, #ffe566, #c9a227 50%, #8b6914);
          color: #3d2410;
          font-weight: 800;
          font-size: 0.85rem;
          box-shadow:
            0 0 30px rgba(255, 215, 0, 0.55),
            inset 0 -8px 20px rgba(0,0,0,0.2);
          border: 3px solid #ffe566;
        }
        .lotus-throne {
          width: 140px;
          height: 28px;
          margin: -6px auto 0;
          border-radius: 50%;
          background: linear-gradient(90deg, #8b2942, #c94b6a, #8b2942);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .ritual-pop {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0,0,0,0.8);
          border: 1px solid #ffd700;
          border-radius: 20px;
          color: #ffd700;
          font-size: 0.9rem;
          animation: pop 0.35s ease;
        }
        @keyframes pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .nave {
          position: relative;
          padding: 8px 10px 12px;
          min-height: 200px;
        }
        .carpet {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 40px;
          width: 42%;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #9b1b3a, #6b1228);
          border-left: 3px solid #c9a227;
          border-right: 3px solid #c9a227;
          opacity: 0.85;
          border-radius: 4px;
        }
        .crowd {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px 10px;
          padding: 8px 4px;
        }
        .person {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 52px;
        }
        .tag {
          font-size: 0.58rem;
          color: #ffd700;
          background: rgba(0,0,0,0.65);
          padding: 1px 4px;
          border-radius: 3px;
          max-width: 52px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .body { font-size: 1.35rem; line-height: 1; }
        .person.bow .body {
          animation: bow 0.55s ease;
        }
        @keyframes bow {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(5px) scale(0.95); }
        }
        .hall-bottom {
          display: flex;
          gap: 10px;
          padding: 10px 12px 14px;
          background: rgba(0,0,0,0.45);
          border-top: 1px solid rgba(201,162,39,0.25);
        }
        .offer-btns {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-content: flex-start;
        }
        .offer-btns span {
          font-size: 0.72rem;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(40, 25, 12, 0.9);
          border: 1px solid rgba(201,162,39,0.35);
          color: #e8d5a3;
        }
        .mini-rank {
          width: 140px;
          font-size: 0.68rem;
          background: rgba(20, 12, 6, 0.9);
          border: 1px solid rgba(201,162,39,0.3);
          border-radius: 8px;
          padding: 6px 8px;
        }
        .mini-title {
          color: #ffd700;
          font-weight: 700;
          margin-bottom: 4px;
          font-size: 0.65rem;
        }
        .mini-row {
          display: flex;
          justify-content: space-between;
          gap: 4px;
          color: #ddd;
          padding: 2px 0;
        }
        .muted { color: #666; }
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
