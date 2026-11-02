import { useState, useEffect, useCallback } from 'react';
import {
  processLike,
  processFollowOrShare,
  processComment,
  processGift,
  RITUAL_LABELS,
  type RuleResult,
  type RitualId,
} from '../lib/rules';
import {
  addMerit,
  addIncense,
  pushLog,
  getTopRanking,
  getLogs,
  getStats,
  addLiveComment,
  resetMerit,
  addLiveMember,
  removeLiveMember,
  clearLiveMembers,
  subscribe,
} from '../lib/store';
import { speak } from '../lib/tts';
import { getSocket, connectTikTok, disconnectTikTok } from '../lib/tiktokSocket';

const BLESSING_WORDS = ['bình an', 'an lành', 'hạnh phúc', 'sức khỏe', 'may mắn', 'hoan hỷ', 'nam mô', 'a di đà', 'cầu an', 'phước lành', 'chúc', 'mong'];

function isBlessing(text: string) {
  const normalized = text.toLowerCase().normalize('NFC');
  return BLESSING_WORDS.some((word) => normalized.includes(word));
}

interface Props {
  onRitual?: (ritual: RitualId, label: string) => void;
  onLiveStatus?: (status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended') => void;
}

export function ControlPanel({ onRitual, onLiveStatus }: Props) {
  const [username, setUsername] = useState('Phật tử');
  const [tiktokUser, setTiktokUser] = useState('lonelyking011');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'ended'>('idle');
  const [liveError, setLiveError] = useState('');
  const [comment, setComment] = useState('');
  const [giftXu, setGiftXu] = useState(1);
  const [ranking, setRanking] = useState(getTopRanking());
  const [logs, setLogs] = useState(getLogs());
  const [stats, setStats] = useState(getStats());
  const [ttsOn, setTtsOn] = useState(true);
  const [voiceVol, setVoiceVol] = useState(85);
  const [lastRitual, setLastRitual] = useState('');
  const [liveChat, setLiveChat] = useState<{ name: string; text: string }[]>([]);
  const [rpcName, setRpcName] = useState('');
  const [rpcPray, setRpcPray] = useState('');

  useEffect(() => {
    return subscribe(() => {
      setRanking(getTopRanking());
      setLogs(getLogs());
      setStats(getStats());
    });
  }, []);

  const applyResult = useCallback(
    (user: string, eventName: string, result: RuleResult) => {
      addMerit(user, result.merit);
      if (result.ritual === 'thap_huong') addIncense(3);
      pushLog({
        user,
        event: eventName,
        ritual: RITUAL_LABELS[result.ritual],
        merit: result.merit,
        detail: result.detail,
      });
      setLastRitual(RITUAL_LABELS[result.ritual]);
      onRitual?.(result.ritual, RITUAL_LABELS[result.ritual]);
      if (ttsOn) {
        const announcement = result.ritual === 'thap_huong'
          ? `Mời đạo hữu ${user} dâng hương lễ Phật. Nguyện cầu bình an.`
          : `${user}. ${RITUAL_LABELS[result.ritual]}. Cộng ${result.merit} công đức.`;
        speak(announcement, 'vi-VN', voiceVol / 100);
      }
    },
    [onRitual, ttsOn, voiceVol]
  );

  useEffect(() => {
    const s = getSocket();
    const onStatus = (data: { status: string }) => {
      if (data.status === 'connecting' || data.status === 'disconnected' || data.status === 'ended') clearLiveMembers();
      setLiveStatus(data.status as typeof liveStatus);
      onLiveStatus?.(data.status as typeof liveStatus);
      if (data.status === 'connected') setLiveError('');
    };
    const onError = (data: { message: string }) => {
      setLiveError(data.message || 'Lỗi');
      setLiveStatus('disconnected');
    };
    const onChat = (data: { nickname: string; comment: string }) => {
      addLiveMember(data.nickname || 'Phật tử');
      addLiveComment(data.nickname || 'Phật tử', data.comment, isBlessing(data.comment) ? 'wish' : 'comment');
      setLiveChat((p) => [{ name: data.nickname, text: data.comment }, ...p].slice(0, 25));
      const result = processComment(data.comment);
      if (result) applyResult(data.nickname, `Live: ${data.comment.slice(0, 36)}`, result);
    };
    const onGift = (data: { nickname: string; giftName: string; totalXu: number }) => {
      addLiveMember(data.nickname || 'Phật tử');
      applyResult(data.nickname, `Quà: ${data.giftName}`, processGift(data.totalXu || 1));
    };
    const onLike = (data: { nickname: string; likeCount: number }) => {
      addLiveMember(data.nickname || 'Phật tử');
      const n = Math.min(data.likeCount || 1, 15);
      for (let i = 0; i < n; i++) applyResult(data.nickname, 'Tim Live', processLike());
    };
    const onSocial = (data: { nickname: string; action: string }) => {
      addLiveMember(data.nickname || 'Phật tử');
      applyResult(
        data.nickname,
        data.action === 'follow' ? 'Follow' : 'Share',
        processFollowOrShare()
      );
    };
    s.on('tiktok:status', onStatus);
    s.on('tiktok:error', onError);
    s.on('tiktok:chat', onChat);
    s.on('tiktok:gift', onGift);
    s.on('tiktok:like', onLike);
    s.on('tiktok:social', onSocial);
    const onMember = (data: { nickname: string }) => addLiveMember(data.nickname || 'Phật tử');
    s.on('tiktok:member', onMember);
    return () => {
      s.off('tiktok:status', onStatus);
      s.off('tiktok:error', onError);
      s.off('tiktok:chat', onChat);
      s.off('tiktok:gift', onGift);
      s.off('tiktok:like', onLike);
      s.off('tiktok:social', onSocial);
      s.off('tiktok:member', onMember);
    };
  }, [applyResult, onLiveStatus]);

  const triggerRitual = (ritual: RitualId, label: string, merit: number, detail: string) => {
    const who = rpcName.trim() || username || 'Admin';
    applyResult(who, rpcPray ? `RPC: ${rpcPray.slice(0, 30)}` : `RPC: ${label}`, {
      ritual,
      merit,
      label,
      detail,
    });
  };

  const statusColor =
    liveStatus === 'connected' ? '#86efac' : liveStatus === 'connecting' ? '#fde047' : '#a89060';

  return (
    <div className="cp">
      <div className="cp-title">
        <span>⚙️ Điều Khiển Live & RPC</span>
        <span className="cp-stats">Hương {stats.incenseCount} · CD {stats.totalMerit}</span>
      </div>

      {/* Âm thanh */}
      <section className="box">
        <h4>🔊 Âm thanh chùa & Giọng đọc</h4>
        <div className="toggle-row">
          <button
            type="button"
            className={ttsOn ? 'tog on' : 'tog'}
            onClick={() => setTtsOn(true)}
          >
            Giọng đọc: BẬT
          </button>
          <button
            type="button"
            className={!ttsOn ? 'tog on' : 'tog'}
            onClick={() => setTtsOn(false)}
          >
            TẮT
          </button>
        </div>
        <label className="slider-label">
          Âm lượng giọng đọc {voiceVol}%
          <input type="range" min={0} max={100} value={voiceVol} onChange={(e) => setVoiceVol(+e.target.value)} />
        </label>
      </section>

      {/* TikTok Live */}
      <section className="box">
        <h4>📡 Kết nối phòng TikTok Live</h4>
        <div className="row">
          <input
            value={tiktokUser}
            onChange={(e) => setTiktokUser(e.target.value)}
            placeholder="lonelyking011"
          />
          <button type="button" className="btn-gold" onClick={() => connectTikTok(tiktokUser.trim())}>
            Kết Nối
          </button>
        </div>
        <button type="button" className="btn-dark full" onClick={() => disconnectTikTok()}>
          Ngắt kết nối
        </button>
        <div className="status" style={{ color: statusColor }}>
          {liveStatus}{liveError ? ` — ${liveError}` : ''}
        </div>
        {liveChat.length > 0 && (
          <div className="chat-mini">
            {liveChat.slice(0, 6).map((c, i) => (
              <div key={i}><b>{c.name}</b>: {c.text}</div>
            ))}
          </div>
        )}
      </section>

      {/* RPC */}
      <section className="box">
        <h4>🛕 Kích hoạt nghi thức (RPC)</h4>
        <input
          value={rpcName}
          onChange={(e) => setRpcName(e.target.value)}
          placeholder="Tên người (vd: Quỳnh_Finn)"
        />
        <input
          value={rpcPray}
          onChange={(e) => setRpcPray(e.target.value)}
          placeholder="Lời cầu… bình an, tài lộc…"
        />
        <div className="grid-btn">
          <button type="button" className="btn-gold" onClick={() => triggerRitual('thap_huong', 'Thắp 3 Nén Hương', 15, 'Thắp hương')}>
            🔥 Thắp 3 Nén Hương
          </button>
          <button type="button" className="btn-red" onClick={() => triggerRitual('tha_den', 'Thả Đèn Hoa Đăng', 10, 'Thả đèn')}>
            🏮 Thả Đèn Hoa Đăng
          </button>
          <button type="button" className="btn-dark" onClick={() => triggerRitual('go_mo', 'Gõ Mõ', 5, 'Gõ mõ')}>
            🥁 Gõ Mõ (+5)
          </button>
          <button type="button" className="btn-dark" onClick={() => triggerRitual('thinh_chuong', 'Thỉnh Chuông', 10, 'Chuông')}>
            🔔 Thỉnh Chuông Chùa
          </button>
          <button type="button" className="btn-dark" onClick={() => triggerRitual('xin_xam', 'Xin Xăm / Gieo Quẻ', 10, 'Xăm')}>
            📜 Xin Xăm / Gieo Quẻ
          </button>
          <button type="button" className="btn-dark" onClick={() => triggerRitual('hoa_sen', 'Dâng Hoa Sen Vàng', 20, 'Hoa sen')}>
            🪷 Dâng Hoa Sen Vàng
          </button>
          <button type="button" className="btn-gold full" onClick={() => triggerRitual('dai_le_kim_long', 'Đại Lễ Kim Long', 50, 'Mưa hoa sen')}>
            🐉 Đại Lễ Kim Long Chầu Phật
          </button>
        </div>
        {lastRitual && <div className="last">Vừa rồi: {lastRitual}</div>}
      </section>

      {/* Giả lập */}
      <section className="box">
        <h4>🧪 Giả lập (test không cần Live)</h4>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên test" />
        <div className="row">
          <button type="button" className="btn-gold" onClick={() => addLiveMember(username)}>Vào lễ · xếp chỗ</button>
          <button type="button" className="btn-dark" onClick={() => removeLiveMember(username)}>Rời ghế</button>
        </div>
        <div className="row">
          <button type="button" className="btn-gold" onClick={() => applyResult(username, 'Tim', processLike())}>❤️ Tim</button>
          <button type="button" className="btn-gold" onClick={() => applyResult(username, 'Follow', processFollowOrShare())}>➕ Follow</button>
        </div>
        <div className="row">
          <input type="number" min={1} value={giftXu} onChange={(e) => setGiftXu(+e.target.value || 1)} style={{ width: 64 }} />
          <button type="button" className="btn-red" onClick={() => applyResult(username, `Quà ${giftXu}`, processGift(giftXu))}>
            🎁 Quà
          </button>
        </div>
        <div className="row">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const t = comment.trim();
              if (!t) return;
              const r = processComment(t);
              if (r) applyResult(username, t.slice(0, 30), r);
              setComment('');
            }}
            placeholder="thắp hương / cầu an / xin xăm…"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn-gold"
            onClick={() => {
              const t = comment.trim();
              if (!t) return;
              const r = processComment(t);
              if (r) applyResult(username, t.slice(0, 30), r);
              setComment('');
            }}
          >
            Gửi
          </button>
        </div>
        <button type="button" className="btn-danger full" onClick={() => resetMerit()}>
          ♻️ Đặt lại công đức
        </button>
      </section>

      {/* Rank + log */}
      <section className="box">
        <h4>TẤM LÒNG THÀNH</h4>
        <ol className="rank">
          {ranking.length === 0 && <li className="muted">Chưa có</li>}
          {ranking.slice(0, 8).map((r, i) => (
            <li key={r.name}>
              <span>{i + 1}. {r.name}</span>
              <span className="pts">{r.points}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="box">
        <h4>Nhật ký</h4>
        <div className="logs">
          {logs.slice(0, 10).map((l) => (
            <div key={l.id} className="log">
              <b>{l.user}</b> {l.event}
              {l.merit > 0 && <span className="pts"> +{l.merit}</span>}
              <div className="sub">{l.ritual}</div>
            </div>
          ))}
          {logs.length === 0 && <div className="muted">Chưa có sự kiện</div>}
        </div>
      </section>

      <style>{`
        .cp { font-size: 0.85rem; }
        .cp-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          color: #ffd700;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .cp-stats { font-weight: 500; font-size: 0.75rem; color: #c9a227; }
        .box {
          background: linear-gradient(165deg, #1e140c, #140e08);
          border: 1px solid rgba(201, 162, 39, 0.4);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .box h4 {
          margin: 0 0 10px;
          font-size: 0.8rem;
          color: #e8c547;
          font-weight: 600;
        }
        input[type="text"], input[type="number"], input:not([type]), input {
          width: 100%;
          padding: 9px 10px;
          margin-bottom: 8px;
          border-radius: 8px;
          border: 1px solid #5c4033;
          background: #0f0a06;
          color: #fff;
          font-size: 0.85rem;
        }
        .row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
        .row input { margin-bottom: 0; }
        .btn-gold, .btn-red, .btn-dark, .btn-danger {
          padding: 8px 10px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-gold { background: linear-gradient(135deg, #c9a227, #e8c547); color: #1a1008; }
        .btn-red { background: linear-gradient(135deg, #8b2942, #c44d6a); color: #fff; }
        .btn-dark { background: #2a1c10; color: #ffd700; border: 1px solid #c9a227; }
        .btn-danger { background: #3d1515; color: #fca5a5; border: 1px solid #7f1d1d; }
        .full { width: 100%; margin-bottom: 8px; }
        .grid-btn {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .grid-btn .full { grid-column: 1 / -1; }
        .toggle-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .tog {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #5c4033;
          background: #1a1008;
          color: #a89060;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.75rem;
        }
        .tog.on {
          background: linear-gradient(135deg, #166534, #22c55e);
          color: #fff;
          border-color: transparent;
        }
        .slider-label {
          display: block;
          font-size: 0.72rem;
          color: #a89060;
          margin-bottom: 6px;
        }
        .slider-label input { width: 100%; margin: 4px 0 0; }
        .status { font-size: 0.75rem; margin-top: 4px; }
        .chat-mini {
          margin-top: 8px;
          max-height: 100px;
          overflow-y: auto;
          font-size: 0.72rem;
          background: #0a0604;
          padding: 6px;
          border-radius: 6px;
        }
        .chat-mini b { color: #ffd700; }
        .last { margin-top: 8px; color: #86efac; font-size: 0.75rem; }
        .rank { list-style: none; margin: 0; padding: 0; }
        .rank li {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .pts { color: #e8c547; font-weight: 600; }
        .logs { max-height: 160px; overflow-y: auto; }
        .log { padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem; }
        .log b { color: #ffd700; }
        .log .sub { color: #a89060; font-size: 0.68rem; }
        .muted { color: #555; }
      `}</style>
    </div>
  );
}
