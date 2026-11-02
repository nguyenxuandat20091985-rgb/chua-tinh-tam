import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RitualId } from '../lib/rules';
import { RITUAL_LABELS } from '../lib/rules';
import { getStats, getTopRanking, getLiveMembers, subscribe } from '../lib/store';

interface Props {
  activeRitual: RitualId | null;
  ritualLabel: string;
  liveStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended';
}

const CROWD = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  side: i % 2 === 0 ? 'left' : 'right',
  row: Math.floor(i / 20),
  col: Math.floor((i % 20) / 2),
  shade: ['#7897a6', '#91a9b5', '#637f8d', '#a5b7bd'][i % 4],
}));

export function TempleView({ activeRitual, ritualLabel, liveStatus }: Props) {
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

  const eventNames = useMemo(() => members.slice(0, 18), [members]);
  const ritual = activeRitual || 'none';
  const isMajorGift = ritual === 'dai_le_kim_long';

  return (
    <div className="temple-live">
      <section className={`sanctuary ${flash ? 'is-ritual' : ''} ritual-${ritual} `} aria-label="Chánh điện Chùa Tịnh Tâm">
        <div className="sanctuary-bg" />
        <div className="ceiling-ornament" aria-hidden="true">✺　❖　✺</div>
        <header className="live-head">
          <span className={`live-pill ${liveStatus === 'connected' ? 'connected' : ''}`}>
            <i /> {liveStatus === 'connected' ? 'ĐANG LIVE' : liveStatus === 'connecting' ? 'ĐANG KẾT NỐI' : liveStatus === 'ended' ? 'LIVE ĐÃ KẾT THÚC' : 'CHƯA KẾT NỐI'}
          </span>
          <span className="hall-title">CHÙA TỊNH TÂM</span>
          <span className="hall-count">🔥 {stats.incenseCount} · {stats.totalMerit} công đức</span>
        </header>

        <div className="sanctuary-architecture" aria-hidden="true">
          <div className="back-wall" />
          <div className="gold-panel panel-left" />
          <div className="gold-panel panel-right" />
          <div className="pillar pillar-left"><span>卍</span></div>
          <div className="pillar pillar-right"><span>卍</span></div>
          <div className="lantern lantern-left">🏮</div>
          <div className="lantern lantern-right">🏮</div>
          <div className="hanging-banner banner-left">南無阿彌陀佛</div>
          <div className="hanging-banner banner-right">南無阿彌陀佛</div>
        </div>

        <div className="halo-rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="buddha-altar">
          <div className="buddha-glow" />
          <svg className="buddha-statue" viewBox="0 0 260 310" role="img" aria-label="Tượng Đức Phật vàng ngồi thiền trên đài sen">
            <defs>
              <linearGradient id="statueGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff2a7"/><stop offset=".28" stopColor="#e8b94d"/><stop offset=".55" stopColor="#9c5d17"/><stop offset=".78" stopColor="#f7d878"/><stop offset="1" stopColor="#8b4c10"/>
              </linearGradient>
              <radialGradient id="statueFace"><stop stopColor="#ffe9a0"/><stop offset="1" stopColor="#bd812c"/></radialGradient>
              <linearGradient id="robeGold" x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#fff0a0"/><stop offset=".5" stopColor="#c58a2c"/><stop offset="1" stopColor="#70400f"/></linearGradient>
              <filter id="goldGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <ellipse cx="130" cy="287" rx="100" ry="13" fill="#4b170e" opacity=".7"/>
            <path d="M35 269 Q15 246 42 235 Q64 229 82 249 Q103 221 130 247 Q157 221 178 249 Q198 229 218 235 Q245 246 225 269Z" fill="#a82f4b" stroke="#f0c76c" strokeWidth="4"/>
            <path d="M48 250 Q130 214 212 250 L198 271 Q130 288 62 271Z" fill="url(#statueGold)" stroke="#ffe39a" strokeWidth="3"/>
            <path d="M69 245 Q130 215 191 245 M60 258 Q130 235 200 258" fill="none" stroke="#fff0b2" strokeWidth="3" opacity=".75"/>
            <path d="M76 215 Q65 169 86 135 Q97 119 130 119 Q163 119 174 135 Q195 169 184 215 Q163 243 130 244 Q97 243 76 215Z" fill="url(#robeGold)" stroke="#f5d47c" strokeWidth="3"/>
            <path d="M83 147 Q111 177 130 225 Q150 177 177 147" fill="none" stroke="#fff0ad" strokeWidth="5" opacity=".75"/>
            <path d="M83 170 Q104 193 130 197 Q156 193 177 170" fill="none" stroke="#8c531a" strokeWidth="3" opacity=".65"/>
            <path d="M81 204 Q105 190 130 205 Q155 190 179 204 L192 222 Q165 239 130 236 Q95 239 68 222Z" fill="url(#statueGold)" stroke="#f6d77f" strokeWidth="3"/>
            <path d="M83 207 Q105 221 130 221 Q155 221 177 207" fill="none" stroke="#fff0b2" strokeWidth="4"/>
            <path d="M93 128 Q92 91 108 75 Q130 62 152 75 Q168 91 167 128 Q154 145 130 145 Q106 145 93 128Z" fill="url(#statueFace)" stroke="#f9df8b" strokeWidth="3"/>
            <path d="M97 91 Q98 51 130 47 Q162 51 163 91 Q148 75 130 77 Q112 75 97 91Z" fill="url(#statueGold)" stroke="#ffe69a" strokeWidth="3"/>
            {Array.from({length: 13},(_,i)=><circle key={i} cx={105+(i%5)*12} cy={60+Math.floor(i/5)*9} r="3.5" fill="#8d5519"/>)}
            <path d="M110 105 Q119 100 126 105 M134 105 Q141 100 150 105" stroke="#71451a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M130 104 L127 117 L132 119" stroke="#9a641e" strokeWidth="2" fill="none"/>
            <path d="M119 128 Q130 135 141 128" stroke="#86511a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M107 159 Q130 174 153 159" fill="none" stroke="#fff0b1" strokeWidth="4" opacity=".7"/>
            <circle cx="130" cy="150" r="6" fill="#ffe99b" filter="url(#goldGlow)"/>
          </svg>
          <div className="altar-table">
            <span>✦　✧　✦　✧　✦</span>
            <div className="offering-row"><b>🪷</b><b>🕯️</b><b>🏺</b><b>🕯️</b><b>🪷</b></div>
          </div>
          <div className="incense-smoke" aria-hidden="true"><i/><i/><i/><i/><i/></div>
        </div>

        <div className="side-offerings left-offerings" aria-hidden="true"><span>🪷</span><span>🕯️</span><span>🏺</span></div>
        <div className="side-offerings right-offerings" aria-hidden="true"><span>🪷</span><span>🕯️</span><span>🏺</span></div>

        <div className="nave-floor">
          <div className="red-carpet"><div className="carpet-border"><span>✥　✥　✥　✥　✥　✥　✥</span></div></div>
          <div className="devotee-crowd" aria-hidden="true">
            {CROWD.map(person => <div key={person.id} className={`devotee ${person.side} row-${person.row}`} style={{'--robe':person.shade, gridColumn: person.side === 'left' ? person.col + 1 : person.col + 12, gridRow: person.row + 1} as CSSProperties}>
              <i className="devotee-head"/><i className="devotee-body"/><i className="devotee-knee"/>
            </div>)}
          </div>
          <div className="live-names" aria-live="polite">
            {eventNames.map((name, i) => <span key={name} className={`live-name name-${i%6}`} style={{'--delay':`${i*75}ms`} as CSSProperties}>
              <b>{name.trim().slice(0,1).toUpperCase()}</b>{name}
            </span>)}
          </div>
        </div>

        <aside className="merit-board">
          <div className="merit-heading">TẤM LÒNG THÀNH</div>
          {ranking.length ? ranking.slice(0,3).map((r,i)=><div className="merit-row" key={r.name}>
            <span className="medal">{['①','②','③'][i]}</span><b>{r.name}</b><strong>{r.points}</strong>
          </div>) : <div className="merit-empty">Chờ tấm lòng thành đầu tiên</div>}
        </aside>

        {flash && <div className={`ritual-overlay ${isMajorGift ? 'lotus-rain' : ''}`} aria-live="assertive">
          {isMajorGift && <div className="petal-rain">{Array.from({length:26},(_,i)=><i key={i} style={{'--x':`${(i*37)%100}%`,'--delay':`${(i%8)*.16}s`} as CSSProperties}>🪷</i>)}</div>}
          <div className="ritual-card"><span>{ritualEmoji(ritual)}</span><b>{ritualLabel || RITUAL_LABELS[ritual]}</b></div>
        </div>}

        <footer className="scene-footer">
          <span className="incense-count">🕯️ {stats.incenseCount} nén hương</span>
          <span>Nam Mô A Di Đà Phật</span>
          <span>⭐ {stats.totalMerit} công đức</span>
        </footer>
      </section>
      <div className="offering-actions" aria-label="Nghi thức dâng lễ">
        <div className="offering-action"><span>🕯️</span><b>Hương trầm</b><small>Thành tâm dâng hương</small></div>
        <div className="offering-action"><span>🪷</span><b>Sen nhỏ</b><small>Dâng một đóa sen</small></div>
        <div className="offering-action premium"><span>🌸</span><b>Sen vàng</b><small>Đại lễ dâng hoa</small></div>
      </div>
      <style>{STYLES}</style>
    </div>
  );
}

function ritualEmoji(id: RitualId) {
  const map: Record<string,string> = { go_mo:'🥁',thinh_chuong:'🔔',thap_huong:'🕯️',tha_den:'🏮',xin_xam:'📜',dang_mam:'🍎',hoa_sen:'🪷',dai_le_kim_long:'🌸',song_phat_tu:'🙏' };
  return map[id] || '✨';
}

const STYLES = `
.temple-live{width:100%;max-width:760px;margin:0 auto;color:#fff4d3}
.sanctuary{position:relative;isolation:isolate;overflow:hidden;aspect-ratio:9/16;min-height:600px;max-height:calc(100svh - 116px);border:1px solid rgba(235,190,91,.62);border-radius:18px;background:linear-gradient(180deg,#321509 0%,#5c2a10 24%,#291309 56%,#100a08 100%);box-shadow:0 18px 50px #0009,inset 0 0 60px #f4bd4b20}
.sanctuary-bg{position:absolute;inset:0;z-index:-3;background:radial-gradient(ellipse at 50% 20%,#ffdc7a66,transparent 29%),radial-gradient(ellipse at 50% 44%,#b16a2738,transparent 48%),linear-gradient(90deg,#160b08,#6a3515 13%,#2b130a 27%,#3a1b0b 50%,#2b130a 73%,#6a3515 87%,#160b08)}
.sanctuary:before{content:"";position:absolute;inset:0;z-index:-1;opacity:.27;background:repeating-linear-gradient(90deg,transparent 0 8%,#f2c76a 8.2% 8.45%,transparent 8.7% 16%),repeating-linear-gradient(0deg,transparent 0 12%,#f2c76a 12.2% 12.4%,transparent 12.6% 24%);mask-image:linear-gradient(#000,transparent 62%)}
.ceiling-ornament{position:absolute;top:8%;left:0;width:100%;text-align:center;color:#f9d77a;font-size:1.1rem;text-shadow:0 0 14px #ffdc75}
.live-head{position:absolute;z-index:12;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:5px;padding:10px 10px 24px;background:linear-gradient(#100804c9,transparent);font-size:clamp(8px,2.1vw,12px)}
.live-pill{white-space:nowrap;background:#5d3522d9;border:1px solid #e4b95788;border-radius:5px;padding:4px 7px;font-weight:800;letter-spacing:.04em}.live-pill i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#aaa;margin-right:3px}.live-pill.connected{background:#c51e32}.live-pill.connected i{background:#fff;box-shadow:0 0 8px #fff}
.hall-title{font-weight:900;letter-spacing:.14em;color:#ffe29a;text-shadow:0 2px 7px #000}.hall-count{white-space:nowrap;color:#ffe5a0;background:#1a0d08a8;border-radius:14px;padding:4px 7px}
.sanctuary-architecture{position:absolute;inset:9% 0 42%;pointer-events:none}
.back-wall{position:absolute;inset:0 12%;border:7px double #b77c32;background:repeating-linear-gradient(90deg,#3b1b0c 0 9%,#9b5d21 9.2% 9.6%,#411b0c 10% 19%);box-shadow:inset 0 0 35px #120803}
.gold-panel{position:absolute;top:8%;bottom:0;width:22%;border:5px ridge #d29a42;background:repeating-radial-gradient(circle at 50% 45%,#e0af4c22 0 3px,#3b1a0b 4px 10px);box-shadow:inset 0 0 24px #f3bd5940}
.panel-left{left:3%}.panel-right{right:3%}
.pillar{position:absolute;top:0;bottom:-4%;width:8%;border:3px solid #e4b15c;border-radius:8px;background:linear-gradient(90deg,#3a1509,#9c4b1d 48%,#421809);box-shadow:0 0 16px #f2b54b44}
.pillar:before,.pillar:after{content:"";position:absolute;left:-45%;width:190%;height:9%;background:linear-gradient(#f7d27a,#7b3715);border:2px solid #dca54e;border-radius:6px}.pillar:before{top:5%}.pillar:after{bottom:4%}
.pillar-left{left:9%}.pillar-right{right:9%}.pillar span{position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);color:#f4d27c;font-size:clamp(17px,4vw,28px)}
.lantern{position:absolute;top:11%;font-size:clamp(23px,5vw,38px);filter:drop-shadow(0 0 12px #ffb73c);animation:lanternGlow 3s ease-in-out infinite}.lantern-left{left:20%}.lantern-right{right:20%}
.hanging-banner{position:absolute;top:0;writing-mode:vertical-rl;color:#f7d987;background:linear-gradient(90deg,#a70e20,#5d0d16);border:2px solid #d5a64e;padding:8px 4px;font-size:clamp(8px,1.8vw,12px);height:45%;text-shadow:0 1px 4px #000}.banner-left{left:2%}.banner-right{right:2%}
.halo-rings{position:absolute;z-index:1;top:17%;left:50%;width:43%;aspect-ratio:1;transform:translateX(-50%);border:2px solid #ffe8a1;border-radius:50%;box-shadow:0 0 12px #ffdb72,0 0 30px #e7a934,0 0 70px #ffcb4d88,inset 0 0 30px #ffdf8b66;background:radial-gradient(circle,#ffeab222,transparent 70%);animation:haloPulse 4s ease-in-out infinite}
.halo-rings span{position:absolute;inset:8%;border:1px solid #ffe39a99;border-radius:50%}.halo-rings span:nth-child(2){inset:17%;border-style:dashed}.halo-rings span:nth-child(3){inset:-8%;border-color:#ffcf6766}
.buddha-altar{position:absolute;z-index:3;top:17%;left:50%;width:58%;height:30%;transform:translateX(-50%);display:flex;align-items:center;flex-direction:column}
.buddha-glow{position:absolute;top:0;width:100%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fff3bd88 0,#ffd76d55 32%,transparent 70%);filter:blur(5px)}
.buddha-statue{position:relative;z-index:2;height:83%;width:100%;filter:drop-shadow(0 0 12px #ffd66b88)}
.altar-table{position:relative;z-index:3;margin-top:-5%;width:130%;height:25%;border:3px ridge #d9a54d;background:linear-gradient(#7b3917,#351407);box-shadow:0 6px 16px #000b;text-align:center;color:#f9d779;font-size:clamp(8px,2vw,13px)}
.altar-table>span{display:block;padding:2px;border-bottom:1px solid #d5a34e}.offering-row{display:flex;justify-content:space-around;font-size:clamp(12px,3vw,22px);padding:1px}
.incense-smoke{position:absolute;z-index:5;bottom:5%;left:50%;height:55%;width:50%;pointer-events:none}.incense-smoke i{position:absolute;bottom:0;left:50%;width:14px;height:70px;border-radius:50%;border-left:5px solid #fff8df77;filter:blur(5px);animation:smokeRise 4s ease-in-out infinite}.incense-smoke i:nth-child(2){left:38%;animation-delay:.7s;height:90px}.incense-smoke i:nth-child(3){left:62%;animation-delay:1.2s}.incense-smoke i:nth-child(4){left:25%;animation-delay:1.8s;height:55px}.incense-smoke i:nth-child(5){left:75%;animation-delay:2.2s}
.side-offerings{position:absolute;z-index:4;top:39%;display:flex;flex-direction:column;gap:12px;font-size:clamp(14px,3vw,24px);filter:drop-shadow(0 0 6px #ffc94e88)}.left-offerings{left:5%}.right-offerings{right:5%}
.nave-floor{position:absolute;z-index:2;left:0;right:0;top:45%;bottom:7%;overflow:hidden;background:linear-gradient(180deg,#3d1b10aa,#160b08)}
.nave-floor:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 9%,#e0ae5222 9.2% 9.5%,transparent 9.8% 19%);opacity:.5}
.red-carpet{position:absolute;z-index:1;top:0;bottom:0;left:50%;width:31%;transform:translateX(-50%);background:repeating-linear-gradient(0deg,#8c1025 0 25px,#a91d34 26px 28px,#7e1022 30px 54px);border-left:3px solid #e7bb62;border-right:3px solid #e7bb62;box-shadow:0 0 20px #0009}
.carpet-border{position:absolute;inset:8px 4px;border:1px solid #e7b75a88;color:#efc76d;text-align:center;writing-mode:vertical-rl;letter-spacing:12px;font-size:9px;opacity:.8}
.devotee-crowd{position:absolute;z-index:2;inset:4% 0 0;display:grid;grid-template-columns:repeat(22,minmax(0,1fr));grid-template-rows:repeat(10,minmax(0,1fr));pointer-events:none}
.devotee{position:relative;display:flex;align-items:flex-end;justify-content:center;transform:scale(var(--scale,.85));filter:drop-shadow(0 3px 2px #0009)}
.devotee.row-0{opacity:.8}.devotee.row-1{opacity:.88}.devotee.row-2{opacity:.96}
.devotee-head{position:absolute;top:12%;width:9px;height:10px;border-radius:48% 48% 44% 44%;background:linear-gradient(90deg,#9b694e,#e0b28a);z-index:2}
.devotee-body{position:absolute;bottom:0;width:20px;height:68%;border-radius:42% 42% 8% 8%;background:linear-gradient(90deg,#3c5c6b,var(--robe) 45%,#405f70);clip-path:polygon(28% 0,72% 0,100% 100%,0 100%);border-top:2px solid #b4c4c8}
.devotee-knee{position:absolute;bottom:0;width:24px;height:18%;border-radius:50%;background:linear-gradient(90deg,#405e6e,var(--robe),#405e6e);opacity:.9}
.live-names{position:absolute;z-index:5;inset:4% 1% 0;display:flex;align-content:flex-start;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:4px 3px;pointer-events:none}
.live-name{max-width:48%;display:flex;align-items:center;gap:4px;padding:2px 6px 2px 3px;border-radius:12px;background:#160c0bd9;border:1px solid #d9ad5b88;color:#fff3d1;font-size:clamp(8px,1.9vw,11px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000;animation:nameFloat 3s ease-in-out infinite alternate;animation-delay:var(--delay)}
.live-name b{display:grid;place-items:center;flex:0 0 15px;height:15px;border-radius:50%;background:#d7a949;color:#3a1b0b;font-size:9px}.name-1{margin-top:16%}.name-2{margin-top:5%}.name-3{margin-top:22%}.name-4{margin-top:10%}.name-5{margin-top:28%}
.merit-board{position:absolute;z-index:9;right:2%;bottom:11%;width:43%;max-width:220px;padding:8px;background:#160d0be8;border:1px solid #d9ad5b;border-radius:11px;box-shadow:0 5px 15px #0008}
.merit-heading{text-align:center;color:#ffdf8c;font-weight:900;font-size:clamp(8px,2vw,12px);letter-spacing:.06em;border-bottom:1px solid #b88a44;padding-bottom:5px;margin-bottom:4px}
.merit-row{display:flex;align-items:center;gap:5px;padding:3px 0;font-size:clamp(8px,1.8vw,11px)}.merit-row b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.merit-row strong{color:#f7d16f}.medal{color:#ffdc81}.merit-empty{font-size:10px;color:#cbb88c;text-align:center;padding:6px 0}
.scene-footer{position:absolute;z-index:10;bottom:0;left:0;right:0;display:flex;justify-content:space-between;gap:3px;padding:8px 9px;background:linear-gradient(transparent,#100805eF);font-size:clamp(8px,1.8vw,11px);color:#f8dda1}.scene-footer span:nth-child(2){font-weight:800;letter-spacing:.08em}
.offering-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px 0 0}
.offering-action{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px;border-radius:11px;border:1px solid #c79a48;background:linear-gradient(160deg,#40200f,#1a0d08);color:#f9dfa0;text-align:center;box-shadow:0 4px 12px #0005}
.offering-action>span{font-size:23px;filter:drop-shadow(0 0 7px #f4c35c66)}.offering-action b{font-size:clamp(10px,2.5vw,13px)}.offering-action small{font-size:9px;color:#c9ad79}.offering-action.premium{border-color:#e4a65c;background:linear-gradient(160deg,#5a1b27,#210d12)}
.ritual-overlay{position:absolute;z-index:20;inset:20% 0 12%;display:grid;place-items:center;pointer-events:none}
.ritual-card{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 20px;border-radius:15px;background:#120a0bdc;border:1px solid #ffdf83;box-shadow:0 0 35px #ffc84f77;color:#ffe5a1;animation:ritualPop 3.8s ease both}
.ritual-card span{font-size:40px;filter:drop-shadow(0 0 12px #ffd76a)}.ritual-card b{font-size:clamp(12px,3vw,17px);text-align:center}
.petal-rain{position:absolute;inset:0;overflow:hidden}.petal-rain i{position:absolute;top:-10%;left:var(--x);font-style:normal;font-size:clamp(18px,4vw,30px);animation:petalFall 3.5s linear var(--delay) infinite}
.is-ritual .incense-smoke i{border-left-color:#fff4d9aa;filter:blur(4px)}
.ritual-thinh_chuong .halo-rings{animation:ringWave 1s ease-out 3}.ritual-go_mo .buddha-altar{animation:drumBeat .25s ease-in-out 5}.ritual-thap_huong .incense-smoke i{animation-duration:1.7s}.ritual-dai_le_kim_long .halo-rings{box-shadow:0 0 22px #fff0a8,0 0 65px #ffd65b,0 0 100px #ffd65b}
@keyframes haloPulse{50%{filter:brightness(1.25);transform:translateX(-50%) scale(1.035)}}@keyframes lanternGlow{50%{filter:drop-shadow(0 0 20px #ffe08a);transform:translateY(-3px)}}@keyframes smokeRise{0%{transform:translateY(0) scale(.7);opacity:0}35%{opacity:.7}100%{transform:translate(12px,-70px) scale(1.5);opacity:0}}@keyframes nameFloat{to{transform:translateY(-5px)}}@keyframes petalFall{to{transform:translate(25px,115vh) rotate(420deg);opacity:.1}}@keyframes ritualPop{0%{opacity:0;transform:scale(.65) translateY(20px)}15%,80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.95) translateY(-20px)}}@keyframes ringWave{to{box-shadow:0 0 0 35px #ffd65b00,0 0 50px #ffd65b}}@keyframes drumBeat{50%{transform:translateX(-50%) scale(1.025)}}
@media(max-width:600px){.temple-live{max-width:100%}.sanctuary{border-radius:10px;max-height:none;min-height:0;height:auto;aspect-ratio:9/16}.merit-board{bottom:11%;width:42%;padding:6px}.devotee-head{width:8px;height:9px}.devotee-body{width:17px}.devotee-knee{width:21px}.live-name{font-size:8px}.side-offerings{top:41%}.offering-action{padding:7px 2px}.offering-action>span{font-size:20px}}
@media(prefers-reduced-motion:reduce){.sanctuary *{animation:none!important}}
`;
