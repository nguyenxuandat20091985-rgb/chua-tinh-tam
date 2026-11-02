import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import { getStats, getTopRanking, getLiveMembers, subscribe } from '../lib/store';
import './LiveChinhDien.css';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
  liveStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended';
  onOffer?: (ritual: RitualId, label: string) => void;
}
const positions = [
  { top: '61%', left: '4%' }, { top: '67%', right: '4%' },
  { top: '73%', left: '12%' }, { top: '78%', right: '9%' },
  { top: '84%', left: '4%' }, { top: '88%', right: '4%' },
  { top: '57%', right: '4%' }, { top: '81%', left: '22%' },
];
const emoji: Record<string, string> = {
  go_mo: '🥁', thinh_chuong: '🔔', thap_huong: '🕯️', tha_den: '🏮',
  xin_xam: '📜', dang_mam: '🍎', hoa_sen: '🪷', dai_le_kim_long: '🌸',
};

export function LiveChinhDien({ activeRitual, ritualLabel, liveStatus, onOffer }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(5));
  const [members, setMembers] = useState(getLiveMembers());
  useEffect(() => subscribe(() => {
    setStats(getStats());
    setRanking(getTopRanking(5));
    setMembers(getLiveMembers());
  }), []);
  useEffect(() => {
    if (!activeRitual || activeRitual === 'none') return;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 4200);
    return () => window.clearTimeout(timer);
  }, [activeRitual, ritualLabel]);

  const ritual = activeRitual || 'none';
  const names = members.filter(Boolean).slice(0, 8);
  const connected = liveStatus === 'connected';
  const liveLabel = connected ? 'LIVE · PHÁP HỘI ĐANG MỞ' :
    liveStatus === 'connecting' ? 'ĐANG KẾT NỐI' : 'CHƯA KẾT NỐI LIVE';
  const topThree = ranking.slice(0, 3);
  const offerings: { id: RitualId; label: string; short: string; icon: string; cls: string }[] = [
    { id: 'thap_huong', label: 'Dâng hương', short: 'Hương trầm', icon: '♨', cls: 'incense' },
    { id: 'hoa_sen', label: 'Cầu an', short: 'Dâng đóa sen', icon: '✥', cls: 'blessing' },
    { id: 'dai_le_kim_long', label: 'Dâng hoa', short: 'Đại lễ sen vàng', icon: '❀', cls: 'lotus' },
  ];

  return <div className="temple-app">
    <main className={'temple-stage' + (connected ? ' is-live' : ' is-offline')} aria-label="Chánh điện Chùa Tịnh Tâm">
      <div className="stage-vignette" />
      <div className="stage-glow" />
      <div className="stage-curtain stage-curtain--left" />
      <div className="stage-curtain stage-curtain--right" />
      <div className="lantern lantern--left"><span /></div>
      <div className="lantern lantern--right"><span /></div>
      <div className="altar-aura"><span /><b /></div>

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark"><i /><b /></span>
          <span><strong>CHÙA TỊNH TÂM</strong><small>Pháp hội trực tuyến</small></span>
        </div>
        <span className={'connection-badge' + (connected ? ' connection-badge--live' : '')}>
          <i className="connection-dot" />{liveLabel}
        </span>
      </header>

      <section className="live-meta">
        <div className="live-meta__eyebrow"><i className="live-dot" />{connected ? 'ĐANG PHÁT TRỰC TIẾP' : 'PHÁP HỘI TĨNH TÂM'}<i className="live-meta__divider" />09:24</div>
        <h1>Giữ một niệm lành<br /><em>cho hôm nay.</em></h1>
        <div className="live-stats">
          <div className="stat-pill"><span className="stat-pill__icon">▥</span><span><small>Người đang lễ</small><strong>{connected ? members.length.toLocaleString('vi-VN') : '—'}</strong></span></div>
          <div className="stat-pill"><span className="stat-pill__icon">✧</span><span><small>Công đức</small><strong>{stats.totalMerit.toLocaleString('vi-VN')}</strong></span></div>
        </div>
      </section>

      <div className="temple-architecture" aria-hidden="true">
        <div className="temple-backwall"><span>✥　❖　✥　❖　✥</span></div>
        <div className="temple-column temple-column--left" />
        <div className="temple-column temple-column--right" />
        <div className="temple-buddha">
          <svg viewBox="0 0 260 310" role="img" aria-label="Tượng Đức Phật vàng ngồi thiền">
            <defs>
              <linearGradient id="templeGold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2a7" /><stop offset=".32" stopColor="#e8b94d" /><stop offset=".65" stopColor="#9c5d17" /><stop offset=".84" stopColor="#f7d878" /><stop offset="1" stopColor="#8b4c10" /></linearGradient>
              <radialGradient id="templeFace"><stop stopColor="#ffe9a0" /><stop offset="1" stopColor="#bd812c" /></radialGradient>
            </defs>
            <ellipse cx="130" cy="287" rx="100" ry="13" fill="#4b170e" opacity=".7" />
            <path d="M35 269Q15 246 42 235Q64 229 82 249Q103 221 130 247Q157 221 178 249Q198 229 218 235Q245 246 225 269Z" fill="#a82f4b" stroke="#f0c76c" strokeWidth="4" />
            <path d="M48 250Q130 214 212 250L198 271Q130 288 62 271Z" fill="url(#templeGold)" stroke="#ffe39a" strokeWidth="3" />
            <path d="M76 215Q65 169 86 135Q97 119 130 119Q163 119 174 135Q195 169 184 215Q163 243 130 244Q97 243 76 215Z" fill="url(#templeGold)" stroke="#f5d47c" strokeWidth="3" />
            <path d="M83 147Q111 177 130 225Q150 177 177 147M83 170Q104 193 130 197Q156 193 177 170" fill="none" stroke="#fff0ad" strokeWidth="4" />
            <path d="M93 128Q92 91 108 75Q130 62 152 75Q168 91 167 128Q154 145 130 145Q106 145 93 128Z" fill="url(#templeFace)" stroke="#f9df8b" strokeWidth="3" />
            <path d="M97 91Q98 51 130 47Q162 51 163 91Q148 75 130 77Q112 75 97 91Z" fill="url(#templeGold)" stroke="#ffe69a" strokeWidth="3" />
            <path d="M110 105Q119 100 126 105M134 105Q141 100 150 105M130 104L127 117L132 119M119 128Q130 135 141 128" stroke="#71451a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="130" cy="150" r="6" fill="#ffe99b" />
          </svg>
        </div>
        <div className="temple-altar"><span>✦　✧　✦　✧　✦</span><b>🪷　🕯️　🏺　🕯️　🪷</b></div>
      </div>

      <div className="incense-smoke incense-smoke--one" />
      <div className="incense-smoke incense-smoke--two" />
      <div className="particles" aria-hidden="true">{Array.from({ length: 14 }, (_, i) =>
        <i key={i} style={{ left: ((i * 29) % 96) + '%', top: (30 + (i * 17) % 48) + '%', '--delay': (i * -.43) + 's', '--duration': (4 + (i % 4)) + 's' } as CSSProperties} />)}</div>

      <section className="temple-floor" aria-label="Phật tử tham dự">
        <div className="temple-carpet"><span>✥　✥　✥　✥　✥　✥　✥</span></div>
        <div className="temple-crowd" aria-hidden="true">
          {Array.from({ length: 100 }, (_, i) => <i key={i} className={'devotee devotee--' + (i % 4)} style={{ left: (i % 2 ? 50 + (i % 10) * 4.8 : 1 + (i % 10) * 4.8) + '%', top: (12 + Math.floor(i / 10) * 8) + '%', '--delay': (i % 7) * -.2 + 's' } as CSSProperties}><b /></i>)}
        </div>
        <div className="live-name-tags">
          {names.length ? names.map((name, i) => <span key={name + i} className={'live-name-tag live-name-tag--' + (i % 2 ? 'right' : 'left')} style={positions[i]}><i />{name}</span>) :
            <><span className="live-name-tag live-name-tag--left" style={positions[0]}><i />Đang chờ Phật tử tham dự</span><span className="live-name-tag live-name-tag--right" style={positions[1]}><i />Kết nối TikTok để hiện tên thật</span></>}
        </div>
      </section>

      <aside className="merit-card">
        <div className="merit-card__header"><span><i className="rank-medal">✦</i> TẤM LÒNG THÀNH</span><small>Hôm nay</small></div>
        <div className="merit-card__list">
          {topThree.length ? topThree.map((r, i) => <div className="merit-row" key={r.name}>
            <span className={'merit-avatar merit-avatar--' + ['coral', 'gold', 'blue'][i]}>{r.name.slice(0, 1).toUpperCase()}</span>
            <span className="merit-row__copy"><strong>{r.name}</strong><small>{['Dâng hương cầu an', 'Xin hồi hướng cha mẹ', 'Cầu nguyện bình an'][i]}</small></span>
            <b>+{r.points.toLocaleString('vi-VN')}</b>
          </div>) : <small>Chờ tấm lòng thành đầu tiên</small>}
        </div>
        <div className="merit-card__foot"><span>Hồi hướng bình an</span><strong>{stats.totalMerit.toLocaleString('vi-VN')} <small>công đức</small></strong></div>
      </aside>

      {flash && <div className="ritual-banner" role="status">
        <span className="ritual-banner__icon">{emoji[ritual] || '✨'}</span>
        <span><small>NGHI LỄ ĐANG DIỄN RA</small><strong>{ritualLabel || RITUAL_LABELS[ritual]}</strong></span>
      </div>}
      <div className="stage-vignette" />
      <section className={'control-dock' + (expanded ? ' is-expanded' : '')}>
        <button className="dock-handle" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}><span /> NGHI LỄ &amp; TƯƠNG TÁC <b className="dock-chevron">⌄</b></button>
        <div className="action-grid">
          {offerings.map(item => <button key={item.id} className={'action-button action-button--' + item.cls} onClick={() => onOffer?.(item.id, item.label)}>
            <span className="action-button__icon">{item.icon}</span><span className="action-button__label">{item.label}</span>
          </button>)}
        </div>
        <div className="dock-expanded">
          <div className="session-card"><span className="session-card__label">PHÁP HỘI TRỰC TUYẾN</span><strong>Giữ tâm an lành</strong><small>{connected ? 'Đang nhận tương tác từ TikTok LIVE' : 'Kết nối TikTok LIVE để hiển thị người tham dự'}</small></div>
          <div className="session-card session-card--stats"><span className="session-card__label">TỔNG CÔNG ĐỨC</span><strong>{stats.totalMerit.toLocaleString('vi-VN')}</strong><small>{stats.incenseCount.toLocaleString('vi-VN')} nén hương</small></div>
        </div>
        <div className="safe-space" />
      </section>
    </main>
  </div>;
}
