import { useEffect, useMemo, useState } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import {
  getStats,
  getTopRanking,
  getLiveMembers,
  subscribe,
} from '../lib/store';
import './LiveChinhDien.css';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
  liveStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended';
  onOffer?: (ritual: RitualId, label: string) => void;
}

/** Ảnh nền chánh điện thật – có thể đổi bằng VITE_TEMPLE_HALL_URL */
const HALL_BG =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_TEMPLE_HALL_URL) ||
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1400&q=80';

const FALLBACK_NAMES = [
  'Thuý sa mạc',
  'Anh Thu',
  'Điện m',
  'Yumi Dương',
  'Tâm An',
  'Chương Văn',
  'Nguyễn Cao',
  'Bot Đảm',
];

const TAG_SLOTS = [
  { top: '58%', left: '6%' },
  { top: '66%', left: '10%' },
  { top: '74%', left: '8%' },
  { top: '82%', left: '14%' },
  { top: '70%', left: '18%' },
  { top: '52%', right: '8%' },
  { top: '62%', right: '6%' },
  { top: '72%', right: '12%' },
];

export function LiveChinhDien({
  activeRitual,
  ritualLabel,
  liveStatus,
  onOffer,
}: Props) {
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(3));
  const [members, setMembers] = useState(getLiveMembers());
  const [now, setNow] = useState(() => formatTime(new Date()));

  useEffect(() => {
    return subscribe(() => {
      setStats(getStats());
      setRanking(getTopRanking(3));
      setMembers(getLiveMembers());
    });
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(formatTime(new Date())), 30_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!activeRitual || activeRitual === 'none') return;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 4000);
    return () => window.clearTimeout(timer);
  }, [activeRitual, ritualLabel]);

  const connected = liveStatus === 'connected';
  const displayNames = useMemo(() => {
    const live = members.filter(Boolean);
    if (live.length > 0) return live.slice(0, 8);
    return FALLBACK_NAMES;
  }, [members]);

  const peopleCount =
    members.length > 0
      ? members.length
      : connected
        ? 1248
        : 0;

  return (
    <div className="lcd">
      <div
        className={`lcd-stage ${flash ? 'is-ritual' : ''} ${connected ? 'is-live' : ''}`}
        style={{ backgroundImage: `url(${HALL_BG})` }}
      >
        <div className="lcd-scrim" />

        {/* Top bar */}
        <header className="lcd-top">
          <div className="lcd-brand">
            <span className="lcd-logo">🪷</span>
            <div>
              <strong>CHÙA TỊNH TÂM</strong>
              <small>Pháp hội trực tuyến</small>
            </div>
          </div>
          <span className={`lcd-badge ${connected ? 'on' : ''}`}>
            {connected ? 'LIVE · PHÁP HỘI ĐANG MỞ' : liveStatus === 'connecting' ? 'ĐANG KẾT NỐI…' : 'CHƯA KẾT NỐI'}
          </span>
        </header>

        {/* Intro */}
        <div className="lcd-intro">
          <div className="lcd-eyebrow">
            <i className="dot" />
            {connected ? 'ĐANG PHÁT TRỰC TIẾP' : 'PHIÊN TĨNH TÂM'} · {now}
          </div>
          <h1>
            Giữ một niệm lành
            <br />
            <em>cho hôm nay.</em>
          </h1>
          <div className="lcd-pills">
            <div className="pill">
              <span className="pill-ico">📶</span>
              <div>
                <small>Người đang lễ</small>
                <b>{peopleCount > 0 ? peopleCount.toLocaleString('vi-VN') : '—'}</b>
              </div>
            </div>
            <div className="pill">
              <span className="pill-ico">✨</span>
              <div>
                <small>Công đức</small>
                <b>{stats.totalMerit.toLocaleString('vi-VN')}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Name tags overlay */}
        <div className="lcd-tags" aria-label="Phật tử">
          {displayNames.map((name, i) => {
            const slot = TAG_SLOTS[i % TAG_SLOTS.length];
            return (
              <span
                key={`${name}-${i}`}
                className="tag"
                style={{
                  top: slot.top,
                  left: slot.left,
                  right: (slot as { right?: string }).right,
                }}
              >
                <i />
                {name}
              </span>
            );
          })}
        </div>

        {/* Ranking card */}
        <aside className="lcd-rank">
          <div className="rank-head">
            <span>◆ TẤM LÒNG THÀNH</span>
            <small>Hôm nay</small>
          </div>
          {ranking.length === 0 && (
            <p className="rank-empty">Chờ tấm lòng thành đầu tiên</p>
          )}
          {ranking.map((r, i) => (
            <div className="rank-row" key={r.name}>
              <span className={`av av-${i}`}>{r.name.slice(0, 1).toUpperCase()}</span>
              <div className="rank-copy">
                <strong>{r.name}</strong>
                <small>{i === 0 ? 'Dâng hương cầu an' : i === 1 ? 'Xin hồi hướng' : 'Cầu nguyện bình an'}</small>
              </div>
              <b>+{r.points}</b>
            </div>
          ))}
          <div className="rank-foot">
            <span>Hồi hướng bình an</span>
            <strong>{stats.incenseCount.toLocaleString('vi-VN')} hương</strong>
          </div>
        </aside>

        {/* Ritual banner */}
        {flash && activeRitual && activeRitual !== 'none' && (
          <div className="lcd-ritual">
            <span className="ritual-ico">{ritualEmoji(activeRitual)}</span>
            <div>
              <small>NGHI THỨC ĐANG DIỄN RA</small>
              <strong>{ritualLabel || RITUAL_LABELS[activeRitual]}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="lcd-dock">
        <div className="dock-label">NGHI LỄ & TƯƠNG TÁC</div>
        <div className="dock-grid">
          <button
            type="button"
            className="dock-btn"
            onClick={() => onOffer?.('thap_huong', 'Dâng hương')}
          >
            <span className="dock-ico">🕯️</span>
            <b>Dâng hương</b>
          </button>
          <button
            type="button"
            className="dock-btn"
            onClick={() => onOffer?.('tha_den', 'Cầu phúc')}
          >
            <span className="dock-ico">☸️</span>
            <b>Cầu phúc</b>
          </button>
          <button
            type="button"
            className="dock-btn accent"
            onClick={() => onOffer?.('hoa_sen', 'Hoa sen')}
          >
            <span className="dock-ico">🪷</span>
            <b>Hoa sen</b>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function ritualEmoji(r: RitualId) {
  const map: Record<string, string> = {
    go_mo: '🥁',
    thinh_chuong: '🔔',
    thap_huong: '🕯️',
    tha_den: '🏮',
    xin_xam: '📜',
    dang_mam: '🍎',
    hoa_sen: '🪷',
    dai_le_kim_long: '🐉',
  };
  return map[r] || '✨';
}
