import { useEffect, useState } from 'react'
import {
  Activity, Battery, Bluetooth, Check, ChevronRight, CircleHelp, Cloud,
  Footprints, HeartPulse, LayoutDashboard, Menu, Moon, Music2, Phone,
  RefreshCw, Settings, ShieldCheck, Smartphone, Watch, Wifi, Zap
} from 'lucide-react'
import { connectWatch, isBluetoothAvailable, type WatchReading } from './bluetooth'

type Tab = 'Overview' | 'My device' | 'Health' | 'Controls' | 'Settings'

const initial: WatchReading = {
  battery: null, heartRate: null, deviceName: 'No device connected',
  connected: false, services: []
}

function App() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [reading, setReading] = useState(initial)
  const [status, setStatus] = useState('Ready to pair')
  const [busy, setBusy] = useState(false)
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('wristos-theme')
    if (saved === 'light') document.documentElement.dataset.theme = 'light'
  }, [])

  const pair = async () => {
    setBusy(true)
    try {
      const connectedDevice = await connectWatch(
        update => setReading(prev => ({ ...prev, ...update })),
        setStatus
      )
      setDevice(connectedDevice)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to connect')
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    device?.gatt?.disconnect()
    setDevice(null)
    setReading(initial)
    setStatus('Disconnected')
  }

  const toggleTheme = () => {
    const light = document.documentElement.dataset.theme !== 'light'
    document.documentElement.dataset.theme = light ? 'light' : 'dark'
    localStorage.setItem('wristos-theme', light ? 'light' : 'dark')
  }

  const nav: { name: Tab; icon: typeof LayoutDashboard }[] = [
    { name: 'Overview', icon: LayoutDashboard }, { name: 'My device', icon: Watch },
    { name: 'Health', icon: HeartPulse }, { name: 'Controls', icon: Zap },
    { name: 'Settings', icon: Settings }
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Activity size={21}/></div><span>Wrist<span className="brand-accent">OS</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>{nav.map(item => {
          const Icon = item.icon
          return <button key={item.name} className={`nav-item ${tab === item.name ? 'active' : ''}`} onClick={() => { setTab(item.name); setMenuOpen(false) }}><Icon size={18}/><span>{item.name}</span>{tab === item.name && <ChevronRight size={15} className="nav-arrow"/>}</button>
        })}</nav>
        <div className="sidebar-bottom">
          <div className="connection-mini"><span className={`status-dot ${reading.connected ? 'online' : ''}`}/><div><strong>{reading.connected ? 'Watch connected' : 'No watch connected'}</strong><small>{reading.connected ? reading.deviceName : 'Pair a device to begin'}</small></div></div>
          <div className="profile"><div className="avatar">W</div><div><strong>WristOS User</strong><small>Personal workspace</small></div><Settings size={16}/></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{tab}</strong></div>
          <div className="top-actions"><span className="secure-label"><ShieldCheck size={15}/> Private session</span><button className="icon-button" onClick={toggleTheme} title="Toggle theme"><Moon size={18}/></button><div className="avatar small">W</div></div>
        </header>

        <div className="content">
          {tab === 'Overview' && <>
            <section className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL WEARABLE HUB</div><h1>Good day<span className="accent">.</span></h1><p className="subheading">Your devices, health signals and daily activity — in one place.</p></div><button className="primary-button" onClick={pair} disabled={busy || reading.connected}><Bluetooth size={17}/>{busy ? 'Connecting…' : reading.connected ? 'Device connected' : 'Connect a watch'}</button></section>
            <div className={`connection-banner ${reading.connected ? 'connected' : ''}`}><div className="banner-icon"><Bluetooth size={21}/></div><div className="banner-copy"><strong>{reading.connected ? 'Your watch is connected' : 'Connect your smartwatch'}</strong><span>{status}</span></div><div className="banner-right"><span className={`status-pill ${reading.connected ? 'green' : ''}`}><i/> {reading.connected ? 'ONLINE' : 'NOT PAIRED'}</span>{reading.connected ? <button className="text-button" onClick={disconnect}>Disconnect</button> : <button className="text-button" onClick={pair} disabled={busy}>{busy ? 'Please wait…' : 'Pair device'} <ChevronRight size={15}/></button>}</div></div>
            <div className="section-heading"><div><h2>Device snapshot</h2><p>Live values appear when your watch exposes compatible Bluetooth services.</p></div><span className="live-label"><span className="pulse"/> LIVE DATA</span></div>
            <div className="metric-grid">
              <Metric icon={<Battery/>} label="Watch battery" value={reading.battery === null ? '—' : `${reading.battery}%`} detail={reading.battery === null ? 'Not available' : 'Read from Battery Service'} tone="violet"/>
              <Metric icon={<HeartPulse/>} label="Heart rate" value={reading.heartRate === null ? '—' : `${reading.heartRate}`} unit={reading.heartRate === null ? '' : 'BPM'} detail={reading.heartRate === null ? 'Waiting for supported sensor' : 'Live Bluetooth measurement'} tone="rose"/>
              <Metric icon={<Footprints/>} label="Daily steps" value="—" detail="Requires watch-specific protocol" tone="blue"/>
              <Metric icon={<Wifi/>} label="Connection" value={reading.connected ? 'Active' : 'Offline'} detail={reading.connected ? 'GATT connection established' : 'No active device'} tone="green"/>
            </div>
            <div className="lower-grid">
              <section className="panel device-panel"><div className="panel-head"><div><h3>Connected device</h3><p>Bluetooth device information</p></div><Watch size={19}/></div><div className="device-visual"><div className="watch-orbit"><Watch size={54} strokeWidth={1.2}/></div><div><strong>{reading.deviceName}</strong><span>{reading.connected ? 'Connected over Bluetooth LE' : 'Waiting for a device'}</span></div></div><div className="device-details"><div><span>Connection</span><strong>{reading.connected ? 'Connected' : 'Not connected'}</strong></div><div><span>Battery service</span><strong>{reading.battery === null ? 'Not detected' : 'Available'}</strong></div><div><span>Heart rate service</span><strong>{reading.heartRate === null ? 'Not detected' : 'Available'}</strong></div></div><button className="outline-button full" onClick={() => setTab('My device')}>View device details <ChevronRight size={16}/></button></section>
              <section className="panel activity-panel"><div className="panel-head"><div><h3>Health & activity</h3><p>Your wellness overview</p></div><Activity size={19}/></div><div className="empty-chart"><div className="chart-icon"><Activity size={24}/></div><strong>Waiting for your data</strong><span>Connect a compatible smartwatch to start receiving supported measurements. No sample readings are shown as real data.</span></div><div className="chart-foot"><span><span className="legend-dot"/> Heart rate stream</span><span>Live when supported</span></div></section>
            </div>
            <div className="note"><CircleHelp size={17}/><span><strong>Compatibility note:</strong> Many watches use brand-specific protocols or companion apps. WristOS currently reads standard Bluetooth Battery and Heart Rate services when the watch makes them available.</span></div>
          </>}

          {tab === 'My device' && <Page title="My device" subtitle="Pair, inspect and manage your Bluetooth smartwatch."><div className="panel device-detail-page"><div className="big-watch"><Watch size={64}/></div><h2>{reading.deviceName}</h2><p>{status}</p><div className="device-details wide"><div><span>Connection status</span><strong>{reading.connected ? 'Connected' : 'Disconnected'}</strong></div><div><span>Battery level</span><strong>{reading.battery === null ? 'Not available' : `${reading.battery}%`}</strong></div><div><span>Bluetooth services</span><strong>{reading.services.length ? reading.services.join(', ') : 'Not discovered'}</strong></div></div><div className="button-row"><button className="primary-button" onClick={pair} disabled={busy || reading.connected}><Bluetooth size={17}/>{busy ? 'Connecting…' : 'Pair new device'}</button>{reading.connected && <button className="outline-button" onClick={disconnect}>Disconnect</button>}</div></div></Page>}

          {tab === 'Health' && <Page title="Health & activity" subtitle="Measurements are displayed only when received from a supported connected device."><div className="metric-grid"><Metric icon={<HeartPulse/>} label="Heart rate" value={reading.heartRate === null ? '—' : `${reading.heartRate} BPM`} detail="Standard BLE Heart Rate Service" tone="rose"/><Metric icon={<Battery/>} label="Battery" value={reading.battery === null ? '—' : `${reading.battery}%`} detail="Standard BLE Battery Service" tone="violet"/></div><div className="panel empty-state"><Activity size={30}/><h3>More health integrations coming next</h3><p>Steps, sleep, SpO₂ and workouts often require a brand-specific SDK or phone health platform integration. They are not universally available through generic Bluetooth.</p></div></Page>}

          {tab === 'Controls' && <Page title="Smart controls" subtitle="Phone and watch controls depend on the connected device, operating system and vendor protocol."><div className="feature-grid"><Feature icon={<Music2/>} title="Media controls" text="Requires a supported media control profile or companion app integration."/><Feature icon={<Phone/>} title="Calls & notifications" text="Requires native Android permissions and compatible watch call/notification features."/><Feature icon={<Smartphone/>} title="Find my phone" text="Requires a phone-side companion service and a supported watch command."/><Feature icon={<RefreshCw/>} title="Watch face sync" text="Requires the manufacturer's watch-face protocol or SDK."/></div><div className="note"><CircleHelp size={17}/><span>These controls are shown as planned integrations. The web dashboard cannot silently control phone features or bypass OS permissions.</span></div></Page>}

          {tab === 'Settings' && <Page title="Settings" subtitle="Manage your WristOS experience."><div className="panel settings-list"><Setting icon={<ShieldCheck/>} title="Privacy first" detail="Bluetooth data stays in this browser session. This starter does not upload health data."/><Setting icon={<Cloud/>} title="Cloud synchronization" detail="Not configured. Add a secure backend only when you need account-based sync."/><Setting icon={<RefreshCw/>} title="Connection behavior" detail="Pairing is user-initiated. Browser support and device permissions apply."/><Setting icon={<CircleHelp/>} title="Browser compatibility" detail={isBluetoothAvailable() ? 'Web Bluetooth API detected in this browser.' : 'Web Bluetooth API not detected. Try Chrome or Edge over HTTPS or localhost.'}/></div><button className="outline-button" onClick={toggleTheme}>Toggle light / dark appearance</button></Page>}
          <footer>WRISTOS <span>•</span> SMARTER CONNECTIONS, CLEARER INSIGHTS <span className="footer-right">Built for real device data</span></footer>
        </div>
      </main>
    </div>
  )
}

function Metric({ icon, label, value, unit, detail, tone }: { icon: React.ReactNode; label: string; value: string; unit?: string; detail: string; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><span className="metric-label">{label}</span><div className="metric-value">{value} <small>{unit}</small></div><div className="metric-detail">{detail}</div></div>
}
function Page({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <><div className="page-heading"><div className="eyebrow">WRISTOS WORKSPACE</div><h1>{title}<span className="accent">.</span></h1><p className="subheading">{subtitle}</p></div>{children}</>
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="panel feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="coming-soon">PROTOCOL INTEGRATION REQUIRED</span></div>
}
function Setting({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="setting-row"><div className="setting-icon">{icon}</div><div><strong>{title}</strong><p>{detail}</p></div><Check size={17} className="setting-check"/></div>
}
export default App