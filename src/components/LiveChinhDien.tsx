import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import {
  getStats,
  getTopRanking,
  getLiveMembers,
  getLiveSeats,
  getLiveComments,
  subscribe,
} from '../lib/store';
import './LiveChinhDien.css';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
  liveStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended';
  onOffer?: (ritual: RitualId, label: string) => void;
}

/** Ảnh chánh điện — bản Chánh Điện Tịnh Tâm */
const HALL_IMG =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_TEMPLE_HALL_URL) ||
  '/temple-hall-preview.webp';

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
  const [liveSeats, setLiveSeats] = useState(getLiveSeats());
  const [liveComments, setLiveComments] = useState(getLiveComments(5));
  const [milestone, setMilestone] = useState<number | null>(null);
  const previousOfferings = useRef(stats.incenseOfferings);
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    return subscribe(() => {
      setStats(getStats());
      setRanking(getTopRanking(3));
      setMembers(getLiveMembers());
      setLiveSeats(getLiveSeats());
      setLiveComments(getLiveComments(5));
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

  useEffect(() => {
    const current = stats.incenseOfferings;
    const previous = previousOfferings.current;
    previousOfferings.current = current;
    if (current > previous && current > 0 && current % 100 === 0) {
      setMilestone(current);
      const timer = window.setTimeout(() => setMilestone(null), 4200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [stats.incenseOfferings]);

  const connected = liveStatus === 'connected';
  const isOffline = !connected && liveStatus !== 'connecting';

  // Chỉ hiện name tag khi ĐÃ kết nối LIVE và có người thật — không bịa tên
  const tags = useMemo(() => connected
    ? liveSeats.map((seat) => ({
      name: seat.occupiedBy || 'Phật tử',
      side: seat.side,
      x: `${seat.x}%`,
      y: `${seat.y}%`,
      depth: seat.depth,
    }))
    : [], [connected, liveSeats]);

  const activePilgrims = useMemo(() => {
    if (!connected) return [];
    return members.slice(0, 4).map((name) => {
      const seat = liveSeats.find((item) => item.occupiedBy === name);
      if (!seat) return null;
      return { name, ...seat };
    }).filter(Boolean) as Array<(typeof liveSeats)[number] & { name: string }>;
  }, [connected, liveSeats, members]);

  const peopleLabel =
    members.length > 0
      ? members.length.toLocaleString('vi-VN')
      : '—';

  const showRitual = activeRitual && activeRitual !== 'none';

  return (
    <div className={`temple-app ${isOffline ? 'is-offline' : 'is-live'}`}>
      <div
        className="temple-stage"
        style={{ ['--temple-image' as string]: `url(${HALL_IMG})` }}
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

        <div className="incense-counter" aria-label="Tổng lượt dâng hương">
          <span className="incense-counter__flame">♨</span>
          <span><small>LƯỢT DÂNG HƯƠNG</small><strong>{stats.incenseOfferings.toLocaleString('vi-VN')}</strong></span>
        </div>

        {milestone !== null && (
          <div className="milestone-blessing" role="status" aria-live="polite">
            <div className="milestone-blessing__petals" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ transform: `rotate(${index * 45}deg) translateY(-18px)` }} />)}
              <b>🪷</b>
            </div>
            <small>PHÁP HỘI HOAN HỶ</small>
            <strong>{milestone.toLocaleString('vi-VN')} lượt dâng hương</strong>
            <span>Nguyện cầu bình an · Hoa sen nở</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="live-name-tags" aria-label="Tên người đang tham dự">
            {tags.map((tag) => (
              <span
                key={tag.name + tag.y + tag.x}
                className={`live-name-tag live-name-tag--${tag.side}`}
                style={{ [tag.side]: tag.x, top: tag.y, '--seat-depth': tag.depth } as CSSProperties}
              >
                <i />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {activePilgrims.length > 0 && (
          <div className="live-pilgrims" aria-label="Phật tử đang hành lễ">
            {activePilgrims.map((pilgrim, index) => (
              <div
                key={`pilgrim-${pilgrim.name}-${pilgrim.id}`}
                className={`live-pilgrim live-pilgrim--${pilgrim.side}`}
                style={{ [pilgrim.side]: `${Math.max(1, pilgrim.x - 1.5)}%`, top: `${pilgrim.y + 4}%`, '--seat-depth': pilgrim.depth, '--pilgrim-delay': `${index * 140}ms` } as CSSProperties}
              >
                <span className="pilgrim-route" />
                <img src={Array.from(pilgrim.name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2 === 0 ? '/devotee-male-praying.webp' : '/devotee-praying.webp'} alt="Phật tử đang chắp tay lễ Phật" />
                {activeRitual === 'thap_huong' && index === 0 && <span className="pilgrim-incense-smoke" />}
              </div>
            ))}
          </div>
        )}

        {connected && liveComments.some((comment) => comment.kind === 'wish') && (
          <div className="blessing-feed" aria-label="Lời chúc tốt đẹp">
            {liveComments.filter((comment) => comment.kind === 'wish').slice(0, 3).map((comment) => (
              <div className="blessing-feed__item" key={comment.id}>
                <span>✦</span><strong>{comment.name}</strong><em>{comment.text}</em>
              </div>
            ))}
          </div>
        )}

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
