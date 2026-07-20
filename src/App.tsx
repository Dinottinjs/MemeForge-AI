import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Toaster, toast } from 'react-hot-toast'

type AuthStep = 'login' | 'register' | '2fa' | 'studio'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('client_token'))
  const [plan, setPlan] = useState<string>(localStorage.getItem('client_plan') || 'FREE')
  const [storedUsername, setStoredUsername] = useState<string>(localStorage.getItem('client_username') || '')
  const [step, setStep] = useState<AuthStep>(token ? 'studio' : 'login')

  // Auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [twoFaCode, setTwoFaCode] = useState('')

  // Studio state
  const [prompt, setPrompt] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [videoResult, setVideoResult] = useState<any>(null)
  const [gpus, setGpus] = useState<any[]>([])
  const [selectedGpu, setSelectedGpu] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Account / 2FA state
  const [showAccount, setShowAccount] = useState(false)
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [enableCode, setEnableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const API = 'http://217.154.145.215/api/v1'
  const SOCKET_URL = 'http://217.154.145.215'

  useEffect(() => {
    if (token) {
      const socket = io(SOCKET_URL, { auth: { token } })
      socket.on('plan_upgraded', (newPlan) => {
        setPlan(newPlan)
        localStorage.setItem('client_plan', newPlan)
        toast.success(`✨ Live-Update: Dein Account wurde auf ${newPlan} hochgestuft!`)
      })
      if ((window as any).electron) {
        (window as any).electron.invoke('get-gpus').then((hw: any[]) => {
          setGpus(hw)
          if (hw.length > 0) setSelectedGpu(hw[0].model)
        })
      }
      fetch2FAStatus()
      return () => { socket.disconnect() }
    }
  }, [token])

  const fetch2FAStatus = async () => {
    const res = await fetch(`${API}/auth/2fa/status`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setTwoFaEnabled(data.totp_enabled ?? false)
  }

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const body = isLogin ? { email, password } : { email, password, username }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.requires_2fa) {
        setTempToken(data.temp_token)
        setStep('2fa')
      } else if (res.ok && data.token) {
        saveSession(data)
        toast.success(isLogin ? 'Erfolgreich eingeloggt!' : 'Account erstellt!')
      } else {
        toast.error(data.error || 'Fehler')
        setError(data.error || 'Fehler')
      }
    } catch { setError('Keine Verbindung.') }
    setLoading(false)
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/auth/2fa/verify-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempToken, code: twoFaCode })
      })
      const data = await res.json()
      if (res.ok && data.token) { saveSession(data) }
      else setError(data.error || 'Ungültiger Code')
    } catch { setError('Verbindungsfehler') }
    setLoading(false)
  }

  const saveSession = (data: any) => {
    localStorage.setItem('client_token', data.token)
    localStorage.setItem('client_plan', data.plan)
    if (data.username) { localStorage.setItem('client_username', data.username); setStoredUsername(data.username) }
    setToken(data.token); setPlan(data.plan); setStep('studio')
  }

  const activateLicense = async () => {
    setLoading(true); setError('')
    const res = await fetch(`${API}/licenses/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ license_key: licenseKey })
    })
    const data = await res.json()
    if (res.ok) { setPlan('PRO'); localStorage.setItem('client_plan', 'PRO'); toast.success('Lizenz erfolgreich eingelöst! Du bist jetzt PRO. 🎉') }
    else { toast.error(data.error || 'Ungültig'); setError(data.error || 'Ungültig') }
    setLoading(false)
  }

  const buyPro = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/payments/create-checkout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.url) {
        if ((window as any).electron) {
           (window as any).electron.openExternal(data.url)
        } else {
           window.open(data.url, '_blank')
        }
      }
      else { toast.error(data.error || 'Checkout konnte nicht geladen werden.'); setError(data.error || 'Checkout konnte nicht geladen werden.') }
    } catch { setError('Verbindungsfehler') }
    setLoading(false)
  }

  const generateMeme = async () => {
    if (!prompt) return
    setLoading(true); setError(''); setVideoResult(null)
    if (plan !== 'FREE' && (window as any).require) {
      const data = await (window as any).electron.invoke('generate-local', prompt, selectedGpu)
      if (data.success) { setVideoResult(data); toast.success('Video generiert!') }
      else { toast.error(data.error); setError(data.error) }
    } else {
      const res = await fetch(`${API}/video/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (res.ok) { setVideoResult(data); toast.success('Video generiert!') }
      else { toast.error(data.error || 'Fehler'); setError(data.error || 'Fehler') }
    }
    setLoading(false)
  }

  const setup2FA = async () => {
    setLoading(true)
    const res = await fetch(`${API}/auth/2fa/setup`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setQrCode(data.qr_code); setTotpSecret(data.secret)
    setLoading(false)
  }

  const enable2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccessMsg('')
    const res = await fetch(`${API}/auth/2fa/enable`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: enableCode })
    })
    const data = await res.json()
    if (res.ok) { toast.success(data.message); setTwoFaEnabled(true); setQrCode(''); setEnableCode('') }
    else { toast.error(data.error); setError(data.error) }
    setLoading(false)
  }

  const disable2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccessMsg('')
    const res = await fetch(`${API}/auth/2fa/disable`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password: disablePassword })
    })
    const data = await res.json()
    if (res.ok) { toast.success(data.message); setTwoFaEnabled(false); setDisablePassword('') }
    else { toast.error(data.error); setError(data.error) }
    setLoading(false)
  }

  const changeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccessMsg('')
    const res = await fetch(`${API}/auth/change-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    })
    const data = await res.json()
    if (res.ok) { toast.success(data.message); setCurrentPassword(''); setNewPassword('') }
    else { toast.error(data.error); setError(data.error) }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('client_token'); localStorage.removeItem('client_plan'); localStorage.removeItem('client_username')
    setToken(null); setStep('login'); setShowAccount(false)
  }

  const BG = (
    <>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
    </>
  )

  if (step === 'login' || step === 'register') return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 relative overflow-hidden">
      {BG}
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      <div className="glass-panel hover-glow-panel p-10 w-full max-w-md z-10 rounded-3xl">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight text-center mb-2">MemeForge-AI</h1>
        <p className="text-slate-400 mt-2 font-medium text-center mb-8">{step === 'login' ? 'Willkommen zurück' : 'Neuen Account erstellen'}</p>
        <form onSubmit={(e) => handleAuth(e, step === 'login')} className="flex flex-col gap-5">
          {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-sm">{error}</div>}
          {step === 'register' && <div>
            <label className="block text-slate-400 mb-2 font-semibold text-sm">Nutzername</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
          </div>}
          <div>
            <label className="block text-slate-400 mb-2 font-semibold text-sm">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
          </div>
          <div>
            <label className="block text-slate-400 mb-2 font-semibold text-sm">Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
          </div>
          <button disabled={loading} className="w-full btn-glow text-white font-bold py-3.5 rounded-xl">{loading ? 'Lade...' : step === 'login' ? 'Einloggen' : 'Registrieren'}</button>
        </form>
        <div className="text-center mt-6">
          <button onClick={() => { setStep(step === 'login' ? 'register' : 'login'); setError('') }} className="text-slate-400 hover:text-white text-sm transition-colors">
            {step === 'login' ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Einloggen'}
          </button>
        </div>
      </div>
    </div>
  )

  if (step === '2fa') return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 relative overflow-hidden">
      {BG}
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      <form onSubmit={handle2FA} className="glass-panel hover-glow-panel p-10 w-full max-w-md z-10 text-center rounded-3xl">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">2-Faktor-Authentifizierung</h2>
        <p className="text-slate-400 text-sm mb-6">Gib den 6-stelligen Code aus deiner Authenticator-App ein.</p>
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-4 text-sm">{error}</div>}
        <input value={twoFaCode} onChange={e => setTwoFaCode(e.target.value)}
          className="w-full zen-input p-4 text-center text-2xl tracking-[0.5em] font-mono mb-6"
          maxLength={6} placeholder="000000" required />
        <button disabled={loading} className="w-full btn-glow text-white font-bold py-3.5 rounded-xl">{loading ? 'Prüfe...' : 'Bestätigen'}</button>
        <button type="button" onClick={() => setStep('login')} className="mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors">← Zurück</button>
      </form>
    </div>
  )

  // Studio + Account settings modal
  return (
    <div className="min-h-screen bg-[#0f172a] p-8 relative overflow-hidden text-slate-50">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      <div className="max-w-5xl mx-auto z-10 relative">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">MemeForge-AI</h1>
            {storedUsername && <p className="text-slate-400 font-medium mt-1">Hey, {storedUsername} 👋</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-5 py-1.5 rounded-full text-sm font-bold border ${plan === 'PRO' ? 'rank-badge-pro' : 'rank-badge-free'}`}>{plan} PLAN</span>
            <button onClick={() => { setShowAccount(!showAccount); setError(''); setSuccessMsg('') }} className="text-slate-400 hover:text-white font-semibold transition-colors text-sm">⚙ Einstellungen</button>
            <button onClick={logout} className="text-slate-400 hover:text-white font-semibold transition-colors text-sm">Logout</button>
          </div>
        </header>

        {/* Account Settings Panel */}
        {showAccount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-panel hover-glow-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">🔑 Passwort ändern</h3>
              {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-3 text-sm">{error}</div>}
              {successMsg && <div className="bg-green-500/10 text-green-400 p-3 rounded-xl border border-green-500/20 mb-3 text-sm">{successMsg}</div>}
              <form onSubmit={changeOwnPassword} className="flex flex-col gap-3">
                <input type="password" placeholder="Aktuelles Passwort" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="zen-input p-3 bg-black/20" required />
                <input type="password" placeholder="Neues Passwort" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="zen-input p-3 bg-black/20" required />
                <button disabled={loading} className="zen-button text-white font-bold py-3 rounded-xl">Ändern</button>
              </form>
            </div>
            <div className="glass-panel hover-glow-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-2">🔐 2-Faktor-Authentifizierung</h3>
              <p className="text-slate-400 text-xs mb-4">Google Authenticator / Authy / Microsoft Authenticator</p>
              {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-3 text-sm">{error}</div>}
              {successMsg && <div className="bg-green-500/10 text-green-400 p-3 rounded-xl border border-green-500/20 mb-3 text-sm">{successMsg}</div>}
              {twoFaEnabled ? (
                <form onSubmit={disable2FA} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-green-400 font-bold mb-2"><span>✅</span> 2FA ist aktiv</div>
                  <input type="password" placeholder="Passwort zur Bestätigung" value={disablePassword} onChange={e => setDisablePassword(e.target.value)} className="zen-input p-3 bg-black/20" required />
                  <button disabled={loading} className="bg-red-600/50 hover:bg-red-600 border border-red-500/30 text-white font-bold py-3 rounded-xl transition-all">Deaktivieren</button>
                </form>
              ) : (
                !qrCode ? (
                  <button onClick={setup2FA} disabled={loading} className="btn-glow text-white font-bold py-3 w-full rounded-xl">{loading ? 'Generiere...' : '🔑 2FA einrichten'}</button>
                ) : (
                  <div>
                    <p className="text-slate-400 text-xs mb-2">Scanne mit deiner Authenticator-App:</p>
                    <img src={qrCode} alt="QR" className="rounded-xl border border-white/10 mb-2 mx-auto" style={{ width: 150 }} />
                    <p className="text-slate-500 text-xs mb-3 break-all text-center">Schlüssel: <span className="text-blue-400 font-mono">{totpSecret}</span></p>
                    <form onSubmit={enable2FA} className="flex flex-col gap-3">
                      <input value={enableCode} onChange={e => setEnableCode(e.target.value)} className="zen-input p-3 text-center text-xl tracking-[0.4em] font-mono" maxLength={6} placeholder="000000" required />
                      <button disabled={loading} className="btn-glow text-white font-bold py-3 rounded-xl">{loading ? 'Prüfe...' : '✅ Aktivieren'}</button>
                    </form>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {plan === 'FREE' && (
          <div className="glass-panel hover-glow-panel p-8 mb-10 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-2xl flex flex-wrap items-center gap-6">
            <div><h2 className="text-xl font-bold text-yellow-500 mb-1">Pro aktivieren</h2><p className="text-slate-400 text-sm">Schalte lokales GPU-Rendering frei.</p></div>
            <div className="flex gap-4 flex-1">
              <input type="text" placeholder="KEY-XXXXXXXX-XXXX" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="flex-1 zen-input p-3 bg-black/20" />
              <button onClick={activateLicense} disabled={loading || !licenseKey} className="btn-glow text-white font-bold px-6 py-3 rounded-xl transition-all">Einlösen</button>
            </div>
            <div className="flex justify-end">
              <button onClick={buyPro} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">💳 Kaufen</button>
            </div>
          </div>
        )}

        <main className="glass-panel neon-box p-10 flex flex-col items-center justify-center rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-2">Studio</h2>
          <p className="text-slate-400 mb-10 text-center">Beschreibe deine Vision und lass die KI auf deiner GPU rendern.</p>
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {plan !== 'FREE' && gpus.length > 0 && (
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <label className="text-slate-400 font-semibold text-sm whitespace-nowrap">GPU:</label>
                <select value={selectedGpu} onChange={e => setSelectedGpu(e.target.value)} className="w-full bg-slate-900 border border-white/10 text-white p-2 rounded-lg outline-none focus:border-blue-500">
                  {gpus.map((g, i) => <option key={i} value={g.model}>{g.vendor} {g.model} ({g.vram}MB)</option>)}
                </select>
              </div>
            )}
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="z.B. Tanzende Katze im Weltall..." className="w-full zen-input p-5 min-h-[140px] resize-none text-lg bg-black/20 rounded-2xl border-white/10" />
            <button onClick={generateMeme} disabled={loading || !prompt} className="btn-glow text-white font-bold py-4 text-lg w-full rounded-2xl">
              {loading ? 'Generierung läuft...' : '✨ Video generieren'}
            </button>
            {error && <p className="text-red-400 text-center font-bold">{error}</p>}
          </div>
          {videoResult && (
            <div className="mt-12 w-full max-w-2xl bg-black/40 p-6 rounded-2xl border border-white/10">
              <p className="text-green-400 font-bold mb-4">✅ {videoResult.message}</p>
              <video src={videoResult.video_url} controls autoPlay className="w-full rounded-xl shadow-2xl border border-white/5" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
