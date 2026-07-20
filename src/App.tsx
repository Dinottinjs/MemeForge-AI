import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('client_token'))
  const [plan, setPlan] = useState<string>(localStorage.getItem('client_plan') || 'FREE')
  const [storedUsername, setStoredUsername] = useState<string>(localStorage.getItem('client_username') || '')
  
  const [view, setView] = useState<'login' | 'register'>('login')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('') 
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Studio State
  const [prompt, setPrompt] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [videoResult, setVideoResult] = useState<any>(null)
  
  // Hardware State
  const [gpus, setGpus] = useState<any[]>([])
  const [selectedGpu, setSelectedGpu] = useState<string>('')
  
  const API_URL = 'http://217.154.145.215:4000/api/v1'

  useEffect(() => {
    if (token) {
      const socket = io('http://217.154.145.215:4000', {
        auth: { token }
      });
      socket.on('plan_upgraded', (newPlan) => {
        setPlan(newPlan);
        localStorage.setItem('client_plan', newPlan);
        alert(`✨ Live-Update: Dein Account wurde erfolgreich auf ${newPlan} hochgestuft!`);
      });
      
      // Fetch GPUs via IPC
      if ((window as any).require) {
        const { ipcRenderer } = (window as any).require('electron')
        ipcRenderer.invoke('get-gpus').then((hardware: any[]) => {
          setGpus(hardware)
          if (hardware.length > 0) setSelectedGpu(hardware[0].model)
        })
      }
      
      return () => { socket.disconnect() };
    }
  }, [token]);

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const body = isLogin ? { email, password } : { email, password, username }
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      
      if (res.ok && data.token) {
        localStorage.setItem('client_token', data.token)
        localStorage.setItem('client_plan', data.plan)
        if (data.username) {
          localStorage.setItem('client_username', data.username)
          setStoredUsername(data.username)
        }
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
    
    // Fallback: If free plan or no local IPC
    if (plan === 'FREE' || !(window as any).require) {
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
    } else {
      // Local Hardware Rendering (PRO Plan + Electron)
      try {
        const { ipcRenderer } = (window as any).require('electron')
        const data = await ipcRenderer.invoke('generate-local', prompt, selectedGpu)
        if (data.success) {
          setVideoResult(data)
        } else {
          setError(data.error || 'Fehler beim lokalen GPU Rendering')
        }
      } catch (e) {
        setError('Fehler bei der Kommunikation mit der Hardware')
      }
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_plan')
    localStorage.removeItem('client_username')
    setToken(null)
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="zen-card p-10 w-full max-w-md z-10 border border-white/5 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              MemeForge-AI
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              {view === 'login' ? 'Willkommen zurück im Studio' : 'Erstelle einen neuen Account'}
            </p>
          </div>
          
          <form onSubmit={(e) => handleAuth(e, view === 'login')} className="flex flex-col gap-5">
            {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-sm font-medium">{error}</div>}
            
            {view === 'register' && (
              <div>
                <label className="block text-slate-400 mb-2 font-semibold text-sm">Nutzername</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
              </div>
            )}
            
            <div>
              <label className="block text-slate-400 mb-2 font-semibold text-sm">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
            </div>
            
            <div>
              <label className="block text-slate-400 mb-2 font-semibold text-sm">Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full zen-input p-3 bg-black/20" required />
            </div>
            
            <button disabled={loading} className="w-full zen-button text-white font-bold py-3.5 mt-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all">
              {loading ? 'Lade...' : (view === 'login' ? 'Einloggen' : 'Registrieren')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              {view === 'login' ? 'Noch keinen Account? Hier registrieren' : 'Bereits registriert? Hier einloggen'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 relative overflow-hidden text-slate-50">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto z-10 relative">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              MemeForge-AI
            </h1>
            {storedUsername && <p className="text-slate-400 font-medium mt-1">Hey, {storedUsername} 👋</p>}
          </div>
          <div className="flex items-center gap-6">
            <span className={`px-5 py-1.5 rounded-full text-sm font-bold border transition-all ${plan === 'PRO' ? 'rank-badge-pro' : 'rank-badge-free'}`}>
              {plan} PLAN
            </span>
            <button onClick={logout} className="text-slate-400 hover:text-white font-semibold transition-colors">Logout</button>
          </div>
        </header>

        {plan === 'FREE' && (
          <div className="zen-card p-8 mb-10 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-2xl flex items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-yellow-500 mb-1">MemeForge-AI Pro aktivieren</h2>
              <p className="text-slate-400 text-sm">Schalte lokales Rendering auf deiner eigenen GPU frei.</p>
            </div>
            <div className="flex gap-4 w-full max-w-md">
              <input 
                type="text" 
                placeholder="KEY-XXXXXXXX-XXXX" 
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="flex-1 zen-input p-3 bg-black/20"
              />
              <button 
                onClick={activateLicense} 
                disabled={loading || !licenseKey}
                className="bg-yellow-500/90 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20"
              >
                Einlösen
              </button>
            </div>
          </div>
        )}

        <main className="zen-card p-10 min-h-[500px] flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl relative">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Studio</h2>
          <p className="text-slate-400 mb-10 text-center">Beschreibe deine Vision und lass die KI auf deiner Grafikkarte rendern.</p>
          
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {/* Hardware Selection Dropdown */}
            {plan === 'PRO' && gpus.length > 0 && (
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <label className="text-slate-400 font-semibold text-sm whitespace-nowrap">Hardware Encoder (GPU):</label>
                <select 
                  value={selectedGpu} 
                  onChange={(e) => setSelectedGpu(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white p-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                >
                  {gpus.map((gpu, index) => (
                    <option key={index} value={gpu.model}>
                      {gpu.vendor} {gpu.model} ({gpu.vram ? gpu.vram + ' MB VRAM' : 'VRAM Unbekannt'})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="z.B. Ein tanzendes Kätzchen im Weltraum..."
              className="w-full zen-input p-5 min-h-[140px] resize-none text-lg bg-black/20 rounded-2xl border-white/10"
            ></textarea>
            
            <button 
              onClick={generateMeme}
              disabled={loading || !prompt}
              className="zen-button text-white font-bold py-4 text-lg tracking-wide w-full rounded-2xl shadow-xl shadow-blue-500/20"
            >
              {loading ? 'Generierung läuft lokal...' : '✨ Video auf GPU Generieren'}
            </button>
            
            {error && <p className="text-red-400 text-center font-bold mt-2">{error}</p>}
          </div>

          {videoResult && (
            <div className="mt-12 w-full max-w-2xl bg-black/40 p-6 rounded-2xl border border-white/10 animate-fade-in">
              <p className="text-green-400 font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">✅</span> {videoResult.message}
              </p>
              <video src={videoResult.video_url} controls autoPlay className="w-full rounded-xl shadow-2xl border border-white/5"></video>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
