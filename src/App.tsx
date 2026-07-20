import { useState, useEffect } from 'react'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('client_token'))
  const [plan, setPlan] = useState<string>(localStorage.getItem('client_plan') || 'FREE')
  const [view, setView] = useState<'login' | 'register'>('login')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Studio State
  const [prompt, setPrompt] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [videoResult, setVideoResult] = useState<any>(null)
  
  const API_URL = 'http://217.154.145.215:4000/api/v1'

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('client_token', data.token)
        localStorage.setItem('client_plan', data.plan)
        setToken(data.token)
        setPlan(data.plan)
      } else {
        setError(data.error || 'Authentifizierung fehlgeschlagen')
      }
    } catch (err) {
      setError('Keine Verbindung zum Server.')
    }
    setLoading(false)
  }

  const activateLicense = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/licenses/activate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ license_key: licenseKey })
      })
      const data = await res.json()
      if (res.ok) {
        setPlan('PRO')
        localStorage.setItem('client_plan', 'PRO')
        alert('Erfolg: ' + data.message)
      } else {
        setError(data.error || 'Lizenz ungültig')
      }
    } catch (e) {
      setError('Verbindungsfehler')
    }
    setLoading(false)
  }

  const generateMeme = async () => {
    if (!prompt) return
    setLoading(true)
    setError('')
    setVideoResult(null)
    try {
      const res = await fetch(`${API_URL}/video/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (res.ok) {
        setVideoResult(data)
      } else {
        setError(data.error || 'Fehler bei der Generierung')
      }
    } catch (e) {
      setError('Verbindungsfehler zur KI-Engine.')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_plan')
    setToken(null)
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4">
        <div className="zen-card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-wide" style={{textShadow: '0 0 15px rgba(255,255,255,0.4)'}}>ZeNmOdZ Studio</h1>
            <p className="text-slate-400 mt-2">{view === 'login' ? 'Willkommen zurück!' : 'Erstelle einen neuen Account'}</p>
          </div>
          
          <form onSubmit={(e) => handleAuth(e, view === 'login')}>
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 border border-red-500/30">{error}</div>}
            
            <div className="mb-4">
              <label className="block text-slate-400 mb-2 font-semibold">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full zen-input p-3" required />
            </div>
            <div className="mb-8">
              <label className="block text-slate-400 mb-2 font-semibold">Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full zen-input p-3" required />
            </div>
            <button disabled={loading} className="w-full zen-button text-white font-bold py-3 mb-4">
              {loading ? 'Lade...' : (view === 'login' ? 'Einloggen' : 'Registrieren')}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-blue-400 hover:text-blue-300 transition-colors">
              {view === 'login' ? 'Noch keinen Account? Registrieren' : 'Bereits registriert? Einloggen'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide" style={{textShadow: '0 0 15px rgba(255,255,255,0.4)'}}>ZeNmOdZ AI Studio</h1>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1 rounded-full text-sm font-bold border ${plan === 'PRO' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-slate-700/50 border-slate-500/30 text-slate-400'}`}>
              {plan} PLAN
            </span>
            <button onClick={logout} className="zen-button px-6 py-2 text-white font-bold text-sm">Logout</button>
          </div>
        </div>

        {plan === 'FREE' && (
          <div className="zen-card p-6 mb-8 border-yellow-500/30 bg-yellow-500/5">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">Pro Version aktivieren</h2>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="KEY-XXXXXXXX-XXXX" 
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="flex-1 zen-input p-3"
              />
              <button 
                onClick={activateLicense} 
                disabled={loading || !licenseKey}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 rounded-full transition-transform hover:scale-105"
              >
                Aktivieren
              </button>
            </div>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
        )}

        <div className="zen-card p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <h2 className="text-2xl font-bold text-white mb-8 z-10">Generiere dein KI Meme</h2>
          
          <div className="w-full max-w-2xl flex flex-col gap-4 z-10">
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Beschreibe dein Meme (z.B. Ein tanzendes Kätzchen im Weltraum)..."
              className="w-full zen-input p-4 min-h-[120px] resize-none text-lg"
            ></textarea>
            
            <button 
              onClick={generateMeme}
              disabled={loading || !prompt}
              className="zen-button text-white font-bold py-4 text-lg tracking-wide w-full"
            >
              {loading ? 'Generiert mit Python KI Engine...' : '🔥 Video Generieren'}
            </button>
            
            {error && <p className="text-red-400 text-center font-bold mt-2">{error}</p>}
          </div>

          {videoResult && (
            <div className="mt-12 w-full max-w-2xl bg-black/40 p-4 rounded-xl border border-white/10 z-10 animate-fade-in">
              <p className="text-green-400 font-bold mb-4">{videoResult.message}</p>
              <video src={videoResult.video_url} controls autoPlay className="w-full rounded-lg shadow-2xl"></video>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
