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
  resetMerit,
  subscribe,
} from '../lib/store';
import { speak } from '../lib/tts';

interface Props {
  onRitual?: (ritual: RitualId, label: string) => void;
}

export function ControlPanel({ onRitual }: Props) {
  const [username, setUsername] = useState('Phật tử');
  const [comment, setComment] = useState('');
  const [giftXu, setGiftXu] = useState(1);
  const [ranking, setRanking] = useState(getTopRanking());
  const [logs, setLogs] = useState(getLogs());
  const [stats, setStats] = useState(getStats());
  const [ttsOn, setTtsOn] = useState(true);
  const [lastRitual, setLastRitual] = useState<string>('');

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
        const msg =
          result.ritual === 'tha_den'
            ? `${user} cầu nguyện. ${result.detail.slice(0, 80)}`
            : `${user}. ${RITUAL_LABELS[result.ritual]}. Cộng ${result.merit} công đức.`;
        speak(msg);
      }
    },
    [onRitual, ttsOn]
  );

  const handleLike = () => applyResult(username || 'Phật tử', 'Thả tim', processLike());
  const handleFollow = () => applyResult(username || 'Phật tử', 'Follow/Share', processFollowOrShare());

  const handleComment = () => {
    const text = comment.trim();
    if (!text) return;
    const result = processComment(text);
    if (result) {
      applyResult(username || 'Phật tử', `Bình luận: ${text.slice(0, 40)}`, result);
    } else {
      pushLog({
        user: username || 'Phật tử',
        event: `Bình luận: ${text.slice(0, 40)}`,
        ritual: '—',
        merit: 0,
        detail: 'Không khớp từ khóa nghi thức',
      });
    }
    setComment('');
  };

  const handleGift = () => {
    const result = processGift(giftXu);
    applyResult(username || 'Phật tử', `Tặng quà ${giftXu} xu`, result);
  };

  const triggerRitual = (ritual: RitualId, label: string, merit: number, detail: string) => {
    applyResult(username || 'Admin', `Lệnh RPC: ${label}`, {
      ritual,
      merit,
      label,
      detail,
    });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Bảng Điều Khiển Chùa Tịnh Tâm</h2>
        <div className="stats">
          Hương đã thắp: <strong>{stats.incenseCount}</strong> | Tổng Công Đức:{' '}
          <strong>{stats.totalMerit}</strong>
        </div>
      </div>

      <div className="grid-2">
        {/* 1. User + TTS */}
        <section className="card">
          <h3>1. Người dùng & Giọng đọc</h3>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên Phật tử / @username"
          />
          <div className="row">
            <label className="check">
              <input type="checkbox" checked={ttsOn} onChange={(e) => setTtsOn(e.target.checked)} />
              Bật giọng đọc (TTS)
            </label>
          </div>
          {lastRitual && (
            <div className="last-ritual">Nghi thức vừa rồi: <strong>{lastRitual}</strong></div>
          )}
        </section>

        {/* 2. Sự kiện TikTok */}
        <section className="card">
          <h3>2. Sự kiện TikTok Live</h3>
          <div className="btn-row">
            <button type="button" className="btn gold" onClick={handleLike}>
              ❤️ Thả tim (+1)
            </button>
            <button type="button" className="btn gold" onClick={handleFollow}>
              ➕ Follow / Share (+10)
            </button>
          </div>
          <div className="row gap">
            <input
              type="number"
              min={1}
              value={giftXu}
              onChange={(e) => setGiftXu(Number(e.target.value) || 1)}
              style={{ width: 80 }}
            />
            <span>xu</span>
            <button type="button" className="btn red" onClick={handleGift}>
              🎁 Tặng quà
            </button>
          </div>
        </section>

        {/* 3. Giả lập bình luận */}
        <section className="card">
          <h3>3. Giả lập Bình luận (từ khóa)</h3>
          <p className="hint">
            Từ khóa: thắp hương, cầu nguyện, nam mô, xin xăm, gieo quẻ, thỉnh chuông, gõ mõ…
          </p>
          <div className="row gap">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Con xin thắp hương / cầu an…"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn gold" onClick={handleComment}>
              Gửi Comment
            </button>
          </div>
        </section>

        {/* 4. Lệnh nghi thức RPC */}
        <section className="card">
          <h3>4. Lệnh Nghi thức (RPC)</h3>
          <div className="ritual-grid">
            <button type="button" className="btn gold" onClick={() => triggerRitual('thap_huong', 'Thắp 3 Nén Hương', 15, 'Thắp hương trước Lư')}>
              🔥 Thắp 3 Nén Hương
            </button>
            <button type="button" className="btn red" onClick={() => triggerRitual('tha_den', 'Thả Đèn Hoa Đăng', 10, 'Thả đèn cầu nguyện')}>
              🏮 Thả Đèn Hoa Đăng
            </button>
            <button type="button" className="btn dark" onClick={() => triggerRitual('go_mo', 'Gõ Mõ 9 Nhịp', 5, 'Gõ mõ tụng kinh')}>
              🥁 Gõ Mõ
            </button>
            <button type="button" className="btn dark" onClick={() => triggerRitual('thinh_chuong', 'Thỉnh Đại Hồng Chung', 10, 'Chuông ngân')}>
              🔔 Thỉnh Chuông
            </button>
            <button type="button" className="btn dark" onClick={() => triggerRitual('xin_xam', 'Xin Xăm / Gieo Quẻ', 10, 'Lắc ống xăm')}>
              📜 Xin Xăm / Gieo Quẻ
            </button>
            <button type="button" className="btn dark" onClick={() => triggerRitual('dang_mam', 'Dâng Mâm Ngũ Quả', 30, 'Dâng mâm')}>
              🍎 Dâng Mâm Ngũ Quả
            </button>
            <button type="button" className="btn gold" onClick={() => triggerRitual('dai_le_kim_long', 'Đại Lễ Kim Long', 50, 'Mưa hoa sen vàng')}>
              🐉 Đại Lễ Kim Long
            </button>
            <button type="button" className="btn danger" onClick={() => resetMerit()}>
              ♻️ Đặt lại Công Đức
            </button>
          </div>
        </section>
      </div>

      {/* Ranking + Log */}
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h3>TẤM LÒNG THÀNH</h3>
          <ol className="rank-list">
            {ranking.length === 0 && <li className="muted">Chưa có</li>}
            {ranking.map((r, i) => (
              <li key={r.name}>
                <span className="rank-num">{i + 1}</span>
                <span className="rank-name">{r.name}</span>
                <span className="rank-pts">{r.points}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="card">
          <h3>Nhật ký Nghi thức</h3>
          <div className="log-box">
            {logs.length === 0 && <div className="muted">Chưa có sự kiện</div>}
            {logs.slice(0, 12).map((l) => (
              <div key={l.id} className="log-item">
                <span className="log-user">{l.user}</span>
                <span className="log-event">{l.event}</span>
                {l.merit > 0 && <span className="log-merit">+{l.merit}</span>}
                <div className="log-ritual">{l.ritual}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .panel { color: #f5e6c8; }
        .panel-header { margin-bottom: 16px; }
        .panel-header h2 { color: #ffd700; font-size: 1.15rem; margin-bottom: 6px; }
        .stats { font-size: 0.85rem; color: #c9a227; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        .card {
          background: rgba(30, 18, 8, 0.9);
          border: 1px solid rgba(201, 162, 39, 0.35);
          border-radius: 12px;
          padding: 14px;
        }
        .card h3 { font-size: 0.9rem; color: #e8c547; margin-bottom: 10px; }
        input[type="text"], input[type="number"], input:not([type]) {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #5c4033;
          background: #1a1008;
          color: #fff;
          margin-bottom: 8px;
        }
        .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .gap { gap: 8px; }
        .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          color: #1a1008;
        }
        .btn.gold { background: linear-gradient(135deg, #c9a227, #e8c547); }
        .btn.red { background: linear-gradient(135deg, #8b2942, #c94b6a); color: #fff; }
        .btn.dark { background: #3d2b1a; color: #ffd700; border: 1px solid #c9a227; }
        .btn.danger { background: #5c1a1a; color: #fca5a5; border: 1px solid #7f1d1d; }
        .ritual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hint { font-size: 0.75rem; color: #a89060; margin-bottom: 8px; }
        .check { font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }
        .last-ritual { margin-top: 8px; font-size: 0.85rem; color: #86efac; }
        .rank-list { list-style: none; font-size: 0.85rem; }
        .rank-list li { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .rank-num { width: 20px; color: #c9a227; font-weight: 700; }
        .rank-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .rank-pts { color: #e8c547; font-weight: 600; }
        .log-box { max-height: 220px; overflow-y: auto; font-size: 0.78rem; }
        .log-item { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .log-user { color: #ffd700; font-weight: 600; margin-right: 6px; }
        .log-event { color: #ddd; }
        .log-merit { color: #86efac; margin-left: 6px; }
        .log-ritual { color: #a89060; font-size: 0.72rem; margin-top: 2px; }
        .muted { color: #666; font-size: 0.85rem; }
      `}</style>
    </div>
  );
}
