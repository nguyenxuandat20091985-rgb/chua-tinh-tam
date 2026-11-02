import { useEffect, useState } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import { getStats, getTopRanking, getLiveMembers, subscribe } from '../lib/store';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
  liveStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended';
}

export function TempleView({ activeRitual, ritualLabel, liveStatus }: Props) {
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(5));
  const [members, setMembers] = useState(getLiveMembers());

  useEffect(() => {
    return subscribe(() => {
      setStats(getStats());
      setRanking(getTopRanking(5));
      setMembers(getLiveMembers());
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
      <div className={`hall ${flash ? 'ritual-on' : ''} ${flash && activeRitual ? `ritual-${activeRitual}` : ''}`}>
        {/* Top status */}
        <div className="hall-top">
          <span className={`live-badge ${liveStatus === 'connected' ? 'is-live' : 'is-offline'}`}>
            {liveStatus === 'connected' ? 'LIVE' : liveStatus === 'connecting' ? 'ĐANG KẾT NỐI' : liveStatus === 'ended' ? 'ĐÃ KẾT THÚC' : 'CHƯA KẾT NỐI'}
          </span>
          <span className="hall-stats">
            🔥 {stats.incenseCount} hương · ⭐ {stats.totalMerit} CD
          </span>
        </div>

        {/* Golden Buddha zone */}
        <div className="altar">
          <div className="rays" />
          {flash && activeRitual && <div className={`ritual-aura ${activeRitual}`} aria-hidden="true" />}
          <div className="buddha-wrap">
            <div className="buddha" role="img" aria-label="Tượng Phật vàng">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="58" r="54" fill="url(#haloGold)" />
                <circle cx="60" cy="43" r="17" fill="#56320f" />
                <path d="M43 43c1-15 9-23 17-23s16 8 17 23c-5-5-10-7-17-7s-12 2-17 7Z" fill="#704515" />
                <path d="M26 101c2-20 14-31 34-31s32 11 34 31c-18 9-50 9-68 0Z" fill="#56320f" />
                <path d="M34 88c12 2 18 10 26 10s14-8 26-10" fill="none" stroke="#d9a844" strokeWidth="5" strokeLinecap="round" />
                <path d="M20 106c12-8 25-8 40-1 15-7 28-7 40 1-19 12-61 12-80 0Z" fill="#8e243d" />
                <defs><linearGradient id="haloGold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0a0" /><stop offset="1" stopColor="#b77b19" /></linearGradient></defs>
              </svg>
            </div>
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
            {members.map((name, i) => (
              <div
                key={name + i}
                className={`person ${flash ? 'bow' : ''}`}
                style={{ animationDelay: `${(i % 6) * 0.05}s` }}
              >
                <span className="tag">{name}</span>
                <span className="body">🙇</span>
              </div>
            ))}
            {members.length === 0 && <div className="muted" style={{ width: '100%', textAlign: 'center' }}>Chưa có Phật tử tương tác trong LIVE</div>}
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
        /* Lightweight temple architecture: roof tiers, columns and altar depth */
        .hall::before {
          content: '';
          position: absolute;
          z-index: 0;
          top: 42px;
          left: 7%;
          right: 7%;
          height: 34px;
          border-top: 5px solid rgba(226, 184, 78, .72);
          border-bottom: 2px solid rgba(226, 184, 78, .35);
          border-radius: 50% 50% 8px 8px / 100% 100% 8px 8px;
          background: linear-gradient(180deg, rgba(111, 35, 27, .7), rgba(34, 16, 10, .12));
          box-shadow: 0 8px 18px rgba(0,0,0,.25);
          pointer-events: none;
        }
        .hall::after {
          content: '';
          position: absolute;
          z-index: 0;
          top: 76px;
          bottom: 110px;
          left: 5%;
          right: 5%;
          border-left: 8px solid rgba(190, 135, 54, .16);
          border-right: 8px solid rgba(190, 135, 54, .16);
          pointer-events: none;
        }
        .altar { isolation: isolate; }
        .ritual-aura {
          position: absolute;
          z-index: 2;
          left: 50%;
          top: 44%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          display: grid;
          place-items: center;
          pointer-events: none;
          font-size: 3rem;
          filter: drop-shadow(0 0 16px rgba(255, 210, 90, .8));
        }
        .ritual-aura::before { content: ''; animation: ritual-emerge 1.8s ease-out infinite; }
        .ritual-aura.thap_huong::before { content: '〰️'; font-size: 3.6rem; opacity: .7; }
        .ritual-aura.go_mo::before { content: '🥁'; }
        .ritual-aura.thinh_chuong::before { content: '🔔'; animation: bell-swing .7s ease-in-out infinite; }
        .ritual-aura.tha_den::before { content: '🏮'; animation: lantern-rise 2.2s ease-in-out infinite; }
        .ritual-aura.hoa_sen::before { content: '🪷'; animation: lotus-open 1.4s ease-in-out infinite; }
        .ritual-aura.dai_le_kim_long::before { content: '✨'; font-size: 4.4rem; }
        .ritual-aura.xin_xam::before { content: '📜'; }
        @keyframes ritual-emerge {
          0% { transform: translateY(14px) scale(.7); opacity: 0; }
          45% { opacity: 1; }
          100% { transform: translateY(-24px) scale(1.15); opacity: 0; }
        }
        @keyframes bell-swing {
          0%, 100% { transform: rotate(-14deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes lantern-rise {
          0%, 100% { transform: translateY(12px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes lotus-open {
          0%, 100% { transform: scale(.82); }
          50% { transform: scale(1.18); }
        }
        .hall.ritual-go_mo .lotus-throne { animation: drum-pulse .28s ease-in-out 5; }
        .hall.ritual-thinh_chuong .rays { animation: bell-glow .7s ease-out 3; }
        .hall.ritual-tha_den .ritual-pop { animation: lantern-rise 2.2s ease-in-out infinite; }
        @keyframes drum-pulse {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.08); }
        }
        @keyframes bell-glow {
          0% { opacity: .5; transform: translateX(-50%) scale(.85); }
          100% { opacity: 1; transform: translateX(-50%) scale(1.25); }
        }
        .hall-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(0,0,0,0.35);
        }
        .live-badge {
          background: #6b6254;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.06em;
        }
        .live-badge.is-live { background: #e11d48; }
        .live-badge.is-offline { background: #62513a; }
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
          width: 118px; height: 118px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,235,150,.22), rgba(201,162,39,.08) 68%, transparent 70%);
          filter: drop-shadow(0 0 22px rgba(255, 215, 0, .55));
        }
        .buddha svg { width: 100%; height: 100%; overflow: visible; }
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
