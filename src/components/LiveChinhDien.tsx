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
const crowd = Array.from({ length: 200 }, (_, id) => ({
  id, side: id % 2 === 0 ? 'left' : 'right',
  row: Math.floor(id / 20), col: Math.floor((id % 20) / 2),
  shade: ['#7897a6', '#91a9b5', '#637f8d', '#a5b7bd'][id % 4],
}));
const placeholder = ['Đang chờ Phật tử tham dự LIVE', 'Kết nối TikTok để hiện tên thật'];
const emoji: Record<string,string> = { go_mo:'🥁', thinh_chuong:'🔔', thap_huong:'🕯️', tha_den:'🏮', xin_xam:'📜', dang_mam:'🍎', hoa_sen:'🪷', dai_le_kim_long:'🌸' };

export function LiveChinhDien({ activeRitual, ritualLabel, liveStatus, onOffer }: Props) {
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [ranking, setRanking] = useState(getTopRanking(5));
  const [members, setMembers] = useState(getLiveMembers());
  useEffect(() => subscribe(() => {
    setStats(getStats()); setRanking(getTopRanking(5)); setMembers(getLiveMembers());
  }), []);
  useEffect(() => {
    if (!activeRitual || activeRitual === 'none') return;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 4200);
    return () => window.clearTimeout(timer);
  }, [activeRitual, ritualLabel]);
  const ritual = activeRitual || 'none';
  const names = members.filter(Boolean).slice(0,18);
  const connected = liveStatus === 'connected';
  const major = ritual === 'dai_le_kim_long';
  return <div className="live-hall">
    <section className={'live-hall-stage ritual-' + ritual + (flash ? ' has-ritual' : '')} aria-label="Chánh điện Chùa Tịnh Tâm">
      <div className="hall-bg"/><div className="hall-glow"/>
      <div className="hall-curtain left"/><div className="hall-curtain right"/>
      <header className="hall-topbar">
        <div className="hall-brand"><span>🪷</span><b>CHÙA TỊNH TÂM<small>Pháp hội trực tuyến</small></b></div>
        <span className={'hall-status' + (connected ? ' connected' : '')}><i/>{connected ? 'LIVE · ĐANG KẾT NỐI' : liveStatus === 'connecting' ? 'ĐANG KẾT NỐI' : 'CHƯA KẾT NỐI'}</span>
      </header>
      <div className="hall-intro">
        <div className="hall-eyebrow"><i/>{connected ? 'ĐANG PHÁT TRỰC TIẾP' : 'PHÁP HỘI TĨNH TÂM'}</div>
        <h2>Giữ một niệm lành<br/><em>cho hôm nay.</em></h2>
        <div className="hall-stats"><span><small>Người đang lễ</small><b>{connected ? members.length.toLocaleString('vi-VN') : '—'}</b></span><span><small>Công đức</small><b>{stats.totalMerit.toLocaleString('vi-VN')}</b></span></div>
      </div>
      <div className="hall-architecture"><div className="hall-backwall">✥　❖　✥　❖　✥</div><div className="hall-pillar left"/><div className="hall-pillar right"/></div>
      <div className="hall-aura"><i/><i/><i/></div>
      <div className="hall-lantern left">✦</div><div className="hall-lantern right">✦</div>
      <div className="hall-buddha">
        <svg viewBox="0 0 260 310" role="img" aria-label="Tượng Đức Phật vàng ngồi thiền">
          <defs><linearGradient id="hallGold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2a7"/><stop offset=".3" stopColor="#e8b94d"/><stop offset=".6" stopColor="#9c5d17"/><stop offset=".8" stopColor="#f7d878"/><stop offset="1" stopColor="#8b4c10"/></linearGradient><radialGradient id="hallFace"><stop stopColor="#ffe9a0"/><stop offset="1" stopColor="#bd812c"/></radialGradient></defs>
          <ellipse cx="130" cy="287" rx="100" ry="13" fill="#4b170e" opacity=".7"/>
          <path d="M35 269Q15 246 42 235Q64 229 82 249Q103 221 130 247Q157 221 178 249Q198 229 218 235Q245 246 225 269Z" fill="#a82f4b" stroke="#f0c76c" strokeWidth="4"/>
          <path d="M48 250Q130 214 212 250L198 271Q130 288 62 271Z" fill="url(#hallGold)" stroke="#ffe39a" strokeWidth="3"/>
          <path d="M76 215Q65 169 86 135Q97 119 130 119Q163 119 174 135Q195 169 184 215Q163 243 130 244Q97 243 76 215Z" fill="url(#hallGold)" stroke="#f5d47c" strokeWidth="3"/>
          <path d="M83 147Q111 177 130 225Q150 177 177 147M83 170Q104 193 130 197Q156 193 177 170" fill="none" stroke="#fff0ad" strokeWidth="4"/>
          <path d="M93 128Q92 91 108 75Q130 62 152 75Q168 91 167 128Q154 145 130 145Q106 145 93 128Z" fill="url(#hallFace)" stroke="#f9df8b" strokeWidth="3"/>
          <path d="M97 91Q98 51 130 47Q162 51 163 91Q148 75 130 77Q112 75 97 91Z" fill="url(#hallGold)" stroke="#ffe69a" strokeWidth="3"/>
          <path d="M110 105Q119 100 126 105M134 105Q141 100 150 105M130 104L127 117L132 119M119 128Q130 135 141 128" stroke="#71451a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="130" cy="150" r="6" fill="#ffe99b"/>
        </svg>
      </div>
      <div className="hall-altar"><span>✦　✧　✦　✧　✦</span><b>🪷　🕯️　🏺　🕯️　🪷</b></div>
      <div className="hall-smoke one"/><div className="hall-smoke two"/>
      <div className="hall-floor">
        <div className="hall-carpet"><span>✥　✥　✥　✥　✥　✥　✥</span></div>
        <div className="hall-crowd" aria-hidden="true">{crowd.map(p => <div key={p.id} className={'devotee ' + p.side} style={{'--robe':p.shade,gridColumn:p.side === 'left' ? p.col+1 : p.col+17,gridRow:p.row+1} as CSSProperties}><i/><b/><em/></div>)}</div>
        <div className="hall-name-tags" aria-label="Tên người tham dự LIVE">
          {names.length ? names.map((name,i)=><span key={name} className={'name-tag tag-' + (i%6)} style={{top:(5 + (i%9)*9)+'%', [i%2 ? 'right' : 'left']:'2%'} as CSSProperties}><b>{name.trim().slice(0,1).toUpperCase()}</b>{name}</span>) : placeholder.map((name,i)=><span key={name} className={'name-tag placeholder p' + i}><b>·</b>{name}</span>)}
        </div>
      </div>
      <aside className="hall-ranking"><b>✦ TẤM LÒNG THÀNH</b>
        {ranking.length ? ranking.slice(0,3).map((r,i)=><div key={r.name}><span>{['①','②','③'][i]}</span><strong>{r.name}</strong><b>{r.points.toLocaleString('vi-VN')}</b></div>) : <small>Chờ tấm lòng thành đầu tiên</small>}
        <footer>{stats.incenseCount.toLocaleString('vi-VN')} nén hương đã dâng</footer>
      </aside>
      {flash && <div className="hall-ritual" aria-live="assertive">
        {ritual === 'thap_huong' && <i className="ritual-smoke"/>}
        {ritual === 'go_mo' && <i className="ritual-drum">◉</i>}
        {ritual === 'thinh_chuong' && <i className="ritual-bell">)))</i>}
        {major && <div className="lotus-rain">{Array.from({length:28},(_,i)=><i key={i} style={{'--x':((i*37)%100)+'%', '--delay':((i%8)*.16)+'s'} as CSSProperties}>🪷</i>)}</div>}
        <b><span>{emoji[ritual] || '✨'}</span>{ritualLabel || RITUAL_LABELS[ritual]}</b>
      </div>}
      <footer className="hall-scene-footer"><span>🕯️ {stats.incenseCount} nén hương</span><strong>Nam Mô A Di Đà Phật</strong><span>✦ {stats.totalMerit} công đức</span></footer>
    </section>
    <div className="hall-offerings">
      <button onClick={() => onOffer?.('thap_huong','Dâng Hương Trầm')}><span>🕯️</span><b>Hương trầm</b><small>Thành tâm dâng hương</small></button>
      <button onClick={() => onOffer?.('hoa_sen','Dâng Sen Nhỏ')}><span>🪷</span><b>Sen nhỏ</b><small>Dâng một đóa sen</small></button>
      <button className="premium" onClick={() => onOffer?.('dai_le_kim_long','Đại lễ Sen Vàng')}><span>🌸</span><b>Sen vàng</b><small>Đại lễ dâng hoa</small></button>
    </div>
  </div>;
}
