import { useState } from 'react'
import './App.css'

function App() {
  const [licenseKey, setLicenseKey] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkLicense = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch('http://217.154.145.215:4000/api/v1/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ license_key: licenseKey })
      })
      const data = await response.json()
      
      if (response.ok) {
        setStatus(`Erfolg: ${data.message}`)
      } else {
        setStatus(`Fehler: ${data.error}`)
      }
    } catch (e) {
      setStatus('Verbindungsfehler zum Server (Port 4000).')
    }
    setLoading(false)
  }

  return (
    <div className="App" style={{ background: '#121212', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🚀 MemeForge-AI Studio</h1>
      <p>Willkommen beim Meme Generator. Bitte aktiviere deine Pro-Lizenz.</p>
      
      <div style={{ marginTop: '2rem', background: '#1e1e1e', padding: '2rem', borderRadius: '8px' }}>
        <h2>Lizenz Aktivierung</h2>
        <input 
          type="text" 
          placeholder="KEY-XXXXXXXX-XXXX" 
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          style={{ padding: '0.5rem', width: '300px', marginRight: '1rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
        />
        <button 
          onClick={checkLicense} 
          disabled={loading || !licenseKey}
          style={{ padding: '0.5rem 1rem', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Prüfe...' : 'Aktivieren'}
        </button>

        {status && (
          <p style={{ marginTop: '1rem', color: status.startsWith('Erfolg') ? '#4CAF50' : '#f44336' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
