import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const templeImage = '/manus-storage/async-images/7jdS4iUJaZ67Ae8C7YkHst/image-1.webp'

const offerings = [
  { name: 'Minh Tâm', note: 'Dâng hương cầu an', amount: '88', tone: 'coral' },
  { name: 'An Nhiên', note: 'Xin hồi hướng cha mẹ', amount: '52', tone: 'gold' },
  { name: 'Thiện Tâm', note: 'Cầu nguyện bình an', amount: '36', tone: 'blue' },
]

const liveTags = [
  { name: 'Thuý sa mạc', side: 'left', x: '7%', y: '58%' },
  { name: 'Chương Văn', side: 'right', x: '7%', y: '58%' },
  { name: 'Anh Thu', side: 'left', x: '17%', y: '64%' },
  { name: 'Nguyễn Cao', side: 'right', x: '17%', y: '64%' },
  { name: 'Điện m', side: 'left', x: '8%', y: '70%' },
  { name: 'Bot Đấm', side: 'right', x: '8%', y: '70%' },
  { name: 'Yumi Dương', side: 'left', x: '22%', y: '76%' },
  { name: 'Hồng Anh', side: 'right', x: '22%', y: '76%' },
  { name: 'Tâm An', side: 'left', x: '4%', y: '82%' },
  { name: 'Phúc Hòa', side: 'right', x: '4%', y: '82%' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    incense: <><path d="M8 18h8"/><path d="M10 15h4"/><path d="M12 15V8"/><path d="M12 8c-2-1.5-1.5-4 .5-5.2"/><path d="M13 5c2-1 2.3-2.7 1.4-4"/></>,
    lotus: <><path d="M12 20c-4.6 0-8-2.5-8-5.5 0-2.2 1.5-4.3 4-5.3.2 2.8 1.5 4.8 4 5.7 2.5-.9 3.8-2.9 4-5.7 2.5 1 4 3.1 4 5.3 0 3-3.4 5.5-8 5.5Z"/><path d="M12 14.8c-2.8-1.6-3.7-4.7-2-7.4 1.3-2 2-3.6 2-5.4 0 1.8.7 3.4 2 5.4 1.7 2.7.8 5.8-2 7.4Z"/><path d="M12 14.8c-3.2-.2-5.5-2-5.9-4.9 2.8-.4 5 .9 5.9 4.9Z"/><path d="M12 14.8c3.2-.2 5.5-2 5.9-4.9-2.8-.4-5 .9-5.9 4.9Z"/></>,
    blessing: <><path d="M12 3v18"/><path d="M5.6 6.2C7.5 4.8 9.6 4.1 12 4.1s4.5.7 6.4 2.1"/><path d="M4.1 11.5c2.3-1.2 4.9-1.8 7.9-1.8s5.6.6 7.9 1.8"/><path d="M5.7 16.8c1.8-1 3.9-1.5 6.3-1.5s4.5.5 6.3 1.5"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    signal: <><path d="M5 18v-3"/><path d="M9 18v-6"/><path d="M13 18V8"/><path d="M17 18V4"/></>,
    spark: <><path d="m12 2 1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2Z"/><path d="m19 15 .5 2.1L22 18l-2.5.9L19 21l-.5-2.1L16 18l2.5-.9L19 15Z"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
  }
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function LiveNameTag({ name, side, x, y }) {
  return (
    <span className={`live-name-tag live-name-tag--${side}`} style={{ [side]: x, top: y }}>
      <i />{name}
    </span>
  )
}

function StatPill({ label, value, icon }) {
  return <div className="stat-pill"><span className="stat-pill__icon"><Icon name={icon} size={14} /></span><span><small>{label}</small><strong>{value}</strong></span></div>
}

function ActionButton({ icon, label, accent, onClick, selected }) {
  return <button className={`action-button action-button--${accent} ${selected ? 'is-selected' : ''}`} onClick={onClick}>
    <span className="action-button__icon"><Icon name={icon} size={23} /></span>
    <span className="action-button__label">{label}</span>
  </button>
}

export default function ChinhDien() {
  const [connection, setConnection] = useState('live')
  const [ritual, setRitual] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeAction, setActiveAction] = useState(null)
  const [incense, setIncense] = useState(1284)
  const [merit, setMerit] = useState(96240)
  const [toast, setToast] = useState('')

  const isLive = connection === 'live'
  const statusLabel = connection === 'offline' ? 'CHƯA KẾT NỐI' : 'LIVE · PHÁP HỘI ĐANG MỞ'
  const ritualLabel = ritual === 'incense' ? 'Nghi thức dâng hương' : ritual === 'lantern' ? 'Nghi thức thả đèn' : ''

  const trigger = (kind, message, amount = 0) => {
    setActiveAction(kind)
    setRitual(kind === 'incense' ? 'incense' : kind === 'lotus' ? 'lantern' : null)
    if (amount) {
      setIncense((current) => current + 1)
      setMerit((current) => current + amount)
    }
    setToast(message)
    window.clearTimeout(window.__tinhtamToast)
    window.__tinhtamToast = window.setTimeout(() => setToast(''), 3200)
  }

  const connect = () => {
    setConnection((current) => current === 'live' ? 'offline' : 'live')
    setToast(connection === 'live' ? 'Đã rời pháp hội. Hẹn gặp lại bạn.' : 'Bạn đã kết nối vào pháp hội trực tuyến.')
    window.clearTimeout(window.__tinhtamToast)
    window.__tinhtamToast = window.setTimeout(() => setToast(''), 3200)
  }

  return (
    <main className={`temple-app ${isLive ? 'is-live' : 'is-offline'} ${ritual ? `ritual-${ritual}` : ''}`}>
      <div className="temple-stage" style={{ '--temple-image': `url(${templeImage})` }}>
        <div className="stage-vignette" />

        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark"><i /><b /></span>
            <span><strong>CHÙA TỊNH TÂM</strong><small>Pháp hội trực tuyến</small></span>
          </div>
          <button className={`connection-badge ${isLive ? 'connection-badge--live' : 'connection-badge--offline'}`} onClick={connect}>
            <span className="connection-dot" />{statusLabel}
          </button>
        </header>

        <section className="live-meta" aria-label="Thông tin pháp hội">
          <div className="live-meta__eyebrow"><span className="live-dot" /> {isLive ? 'ĐANG PHÁT TRỰC TIẾP' : 'PHIÊN TĨNH TÂM'} <span className="live-meta__divider" /> <span>09:24</span></div>
          <h1>Giữ một niệm lành<br /><em>cho hôm nay.</em></h1>
          <div className="live-stats">
            <StatPill label="Người đang lễ" value={isLive ? '1.248' : '—'} icon="signal" />
            <StatPill label="Công đức" value={merit.toLocaleString('vi-VN')} icon="spark" />
          </div>
        </section>

        {isLive && <div className="live-name-tags" aria-label="Tên người đang tham dự LIVE">
          {liveTags.map((tag) => <LiveNameTag key={tag.name} {...tag} />)}
        </div>}

        <aside className="merit-card">
          <div className="merit-card__header"><span><i className="rank-medal">✦</i> TẤM LÒNG THÀNH</span><small>Hôm nay</small></div>
          <div className="merit-card__list">
            {offerings.map((offering, index) => <div className="merit-row" key={offering.name}><span className={`merit-avatar merit-avatar--${offering.tone}`}>{offering.name.slice(0, 1)}</span><span className="merit-row__copy"><strong>{offering.name}</strong><small>{offering.note}</small></span><b>+{offering.amount}</b></div>)}
          </div>
          <div className="merit-card__foot"><span>Hồi hướng bình an</span><strong>{incense.toLocaleString('vi-VN')} <small>hương</small></strong></div>
        </aside>

        {ritual && <div className="ritual-banner"><span className="ritual-banner__icon"><Icon name={ritual === 'incense' ? 'incense' : 'lotus'} size={18} /></span><span><small>NGHI THỨC ĐANG DIỄN RA</small><strong>{ritualLabel}</strong></span><button aria-label="Đóng nghi thức" onClick={() => setRitual(null)}><Icon name="close" size={15} /></button></div>}

        {toast && <div className="toast" role="status"><span className="toast__spark">✦</span>{toast}</div>}

        <section className={`control-dock ${isExpanded ? 'is-expanded' : ''}`}>
          <button className="dock-handle" onClick={() => setIsExpanded((current) => !current)} aria-label={isExpanded ? 'Thu gọn bảng điều khiển' : 'Mở bảng điều khiển'}>
            <span /><small>{isExpanded ? 'THU GỌN' : 'NGHI LỄ & TƯƠNG TÁC'}</small><Icon name="chevron" size={16} />
          </button>
          <div className="action-grid">
            <ActionButton icon="incense" label="Dâng hương" accent="incense" selected={activeAction === 'incense'} onClick={() => trigger('incense', 'Hương lòng đã được dâng lên.', 8)} />
            <ActionButton icon="blessing" label="Cầu phúc" accent="blessing" selected={activeAction === 'blessing'} onClick={() => trigger('blessing', 'Lời nguyện của bạn đã được ghi nhận.', 5)} />
            <ActionButton icon="lotus" label="Hoa sen" accent="lotus" selected={activeAction === 'lotus'} onClick={() => trigger('lotus', 'Một đóa sen lành gửi vào pháp hội.', 12)} />
          </div>
          <div className="dock-expanded">
            <div className="session-card"><span className="session-card__label">TRẠNG THÁI PHIÊN</span><strong>{isLive ? 'Đang kết nối ổn định' : 'Chưa kết nối pháp hội'}</strong><small>{isLive ? 'Bạn đang có mặt trong chánh điện.' : 'Chạm nút LIVE để cùng tham dự.'}</small></div>
            <button className={`connect-cta ${isLive ? 'is-connected' : ''}`} onClick={connect}><span className="connect-cta__ring" />{isLive ? 'Rời pháp hội' : 'Kết nối LIVE'}</button>
          </div>
          <div className="safe-space" />
        </section>
      </div>
    </main>
  )
}


createRoot(document.getElementById('root')).render(<ChinhDien />)
