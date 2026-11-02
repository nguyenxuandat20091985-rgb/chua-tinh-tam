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

/**
 * Ưu tiên ảnh Manus anh upload vào public/temple-hall.jpg
 * Nếu chưa có → dùng ảnh chánh điện Phật (Pexels) để không bị nền đen.
 */
const LOCAL_IMG = '/temple-hall.jpg';
const LOCAL_WEBP = '/temple-hall.webp';
const LOCAL_CLEAN = '/temple-hall-clean.png';
const REMOTE_TEMPLE =
  'https://images.pexels.com/photos/34035030/pexels-photo-34035030.jpeg?auto=compress&cs=tinysrgb&w=1400';

const ENV_IMG =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_TEMPLE_HALL_URL
    : undefined;

const DEFAULT_TAGS = [
  { name: 'Thuý sa mạc', side: 'left' as const, x: '7%', y: '58%' },
  { name: 'Chương Văn', side: 'right' as const, x: '7%', y: '58%' },
  { name: 'Anh Thu', side: 'left' as const, x: '17%', y: '64%' },
  { name: 'Nguyễn Cao', side: 'right' as const, x: '17%', y: '64%' },
  { name: 'Điện m', side: 'left' as const, x: '8%', y: '70%' },
  { name: 'Bot Đảm', side: 'right' as const, x: '8%', y: '70%' },
  { name: 'Yumi Dương', side: 'left' as const, x: '22%', y: '76%' },
  { name: 'Tâm An', side: 'left' as const, x: '4%', y: '82%' },
];

const TONES = ['coral', 'gold', 'blue'] as const;

export function LiveChinhDien({
  activeRitual,
  ritualLabel,
  liveStatus,
  onOffer,
}: Props) {
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(3));
  const [members, setMembers] = useState(getLiveMembers());
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
  const [bgUrl, setBgUrl] = useState(ENV_IMG || REMOTE_TEMPLE);

  useEffect(() => {
    return subscribe(() => {
      setStats(getStats());
      setRanking(getTopRanking(3));
      setMembers(getLiveMembers());
    });
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setNow(
        new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 30000);
    return () => window.clearInterval(t);
  }, []);

  // Thử lần lượt: env → local Manus → remote
  useEffect(() => {
    if (ENV_IMG) {
      setBgUrl(ENV_IMG);
      return;
    }
    let cancelled = false;
    const tryUrl = (url: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });

    (async () => {
      for (const url of [LOCAL_IMG, LOCAL_WEBP, LOCAL_CLEAN, REMOTE_TEMPLE]) {
        const ok = await tryUrl(url);
        if (cancelled) return;
        if (ok) {
          setBgUrl(url);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const connected = liveStatus === 'connected';
  const isOffline = !connected && liveStatus !== 'connecting';

  const tags = useMemo(() => {
    const live = members.filter(Boolean).slice(0, 8);
    if (live.length === 0) return DEFAULT_TAGS;
    return live.map((name, i) => {
      const base = DEFAULT_TAGS[i % DEFAULT_TAGS.length];
      return { ...base, name };
    });
  }, [members]);

  const peopleLabel =
    members.length > 0
      ? members.length.toLocaleString('vi-VN')
      : connected
        ? '1.248'
        : '—';

  const showRitual = activeRitual && activeRitual !== 'none';

  return (
    <div className={`temple-app ${isOffline ? 'is-offline' : 'is-live'}`}>
      <div
        className="temple-stage"
        style={{ ['--temple-image' as string]: `url(${bgUrl})` }}
      >
        <div className="stage-vignette" />

        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark">🪷</span>
            <span>
              <strong>CHÙA TỊNH TÂM</strong>
              <small>Pháp hội trực tuyến</small>
            </span>
          </div>
          <span
            className={`connection-badge ${
              connected ? 'connection-badge--live' : ''
            }`}
          >
            <span className="connection-dot" />
            {connected
              ? 'LIVE · PHÁP HỘI ĐANG MỞ'
              : liveStatus === 'connecting'
                ? 'ĐANG KẾT NỐI…'
                : 'CHƯA KẾT NỐI'}
          </span>
        </header>

        <section className="live-meta" aria-label="Thông tin pháp hội">
          <div className="live-meta__eyebrow">
            <span className="live-dot" />{' '}
            {connected ? 'ĐANG PHÁT TRỰC TIẾP' : 'PHIÊN TĨNH TÂM'}
            <span className="live-meta__divider" />
            <span>{now}</span>
          </div>
          <h1>
            Giữ một niệm lành
            <br />
            <em>cho hôm nay.</em>
          </h1>
          <div className="live-stats">
            <div className="stat-pill">
              <span className="stat-pill__icon">📶</span>
              <span>
                <small>Người đang lễ</small>
                <strong>{peopleLabel}</strong>
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill__icon">✨</span>
              <span>
                <small>Công đức</small>
                <strong>{stats.totalMerit.toLocaleString('vi-VN')}</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="live-name-tags" aria-label="Tên người đang tham dự">
          {tags.map((tag) => (
            <span
              key={tag.name + tag.y}
              className={`live-name-tag live-name-tag--${tag.side}`}
              style={{ [tag.side]: tag.x, top: tag.y }}
            >
              <i />
              {tag.name}
            </span>
          ))}
        </div>

        <aside className="merit-card">
          <div className="merit-card__header">
            <span>
              <i className="rank-medal">✦</i> TẤM LÒNG THÀNH
            </span>
            <small>Hôm nay</small>
          </div>
          <div className="merit-card__list">
            {ranking.length === 0 && (
              <p className="merit-empty">Chờ tấm lòng thành đầu tiên</p>
            )}
            {ranking.map((r, index) => (
              <div className="merit-row" key={r.name}>
                <span className={`merit-avatar merit-avatar--${TONES[index % 3]}`}>
                  {r.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="merit-row__copy">
                  <strong>{r.name}</strong>
                  <small>
                    {index === 0
                      ? 'Dâng hương cầu an'
                      : index === 1
                        ? 'Xin hồi hướng cha mẹ'
                        : 'Cầu nguyện bình an'}
                  </small>
                </span>
                <b>+{r.points}</b>
              </div>
            ))}
          </div>
          <div className="merit-card__foot">
            <span>Hồi hướng bình an</span>
            <strong>
              {stats.incenseCount.toLocaleString('vi-VN')}{' '}
              <small>hương</small>
            </strong>
          </div>
        </aside>

        {showRitual && (
          <div className="ritual-banner">
            <span className="ritual-banner__icon">
              {activeRitual === 'thap_huong'
                ? '🕯️'
                : activeRitual === 'hoa_sen'
                  ? '🪷'
                  : '✨'}
            </span>
            <span>
              <small>NGHI THỨC ĐANG DIỄN RA</small>
              <strong>{ritualLabel || RITUAL_LABELS[activeRitual!]}</strong>
            </span>
          </div>
        )}
      </div>

      <section className="control-dock" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="dock-label">NGHI LỄ & TƯƠNG TÁC</div>
        <div className="action-grid">
          <button
            type="button"
            className="action-button action-button--incense"
            onClick={() => onOffer?.('thap_huong', 'Dâng hương')}
          >
            <span className="action-button__icon">🕯️</span>
            <span className="action-button__label">Dâng hương</span>
          </button>
          <button
            type="button"
            className="action-button action-button--blessing"
            onClick={() => onOffer?.('tha_den', 'Cầu phúc')}
          >
            <span className="action-button__icon">☸️</span>
            <span className="action-button__label">Cầu phúc</span>
          </button>
          <button
            type="button"
            className="action-button action-button--lotus"
            onClick={() => onOffer?.('hoa_sen', 'Hoa sen')}
          >
            <span className="action-button__icon">🪷</span>
            <span className="action-button__label">Hoa sen</span>
          </button>
        </div>
      </section>
    </div>
  );
}
