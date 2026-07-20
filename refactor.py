import sys

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add react-hot-toast import
code = code.replace("import { useState, useEffect } from 'react'\nimport { io } from 'socket.io-client'", "import { useState, useEffect } from 'react'\nimport { io } from 'socket.io-client'\nimport { Toaster, toast } from 'react-hot-toast'")

# Replace alert with toast
code = code.replace("alert(`✨ Live-Update: Dein Account wurde auf ${newPlan} hochgestuft!`)", "toast.success(`✨ Live-Update: Dein Account wurde auf ${newPlan} hochgestuft!`)")
code = code.replace("alert(data.message)", "toast.success(data.message)")

# Refactor electron calls
code = code.replace("if ((window as any).require) {", "if ((window as any).electron) {")
code = code.replace("const { ipcRenderer } = (window as any).require('electron')\n        ipcRenderer.invoke", "(window as any).electron.invoke")
code = code.replace("const { shell } = (window as any).require('electron')\n           shell.openExternal(data.url)", "(window as any).electron.openExternal(data.url)")
code = code.replace("const { ipcRenderer } = (window as any).require('electron')\n      const data = await ipcRenderer.invoke", "const data = await (window as any).electron.invoke")

# Add Toaster to returns
code = code.replace("{BG}", "{BG}\n      <Toaster position=\"bottom-right\" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />")
code = code.replace("<div className=\"max-w-5xl mx-auto z-10 relative\">", "<Toaster position=\"bottom-right\" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />\n      <div className=\"max-w-5xl mx-auto z-10 relative\">")

# Refactor inline errors/success to toasts for actions
# changeOwnPassword
code = code.replace("if (res.ok) { setSuccessMsg(data.message); setCurrentPassword(''); setNewPassword('') }\n    else setError(data.error)", "if (res.ok) { toast.success(data.message); setCurrentPassword(''); setNewPassword('') }\n    else { toast.error(data.error); setError(data.error) }")

# activateLicense
code = code.replace("if (res.ok) { setPlan('PRO'); localStorage.setItem('client_plan', 'PRO'); toast.success(data.message) }\n    else setError(data.error || 'Ungültig')", "if (res.ok) { setPlan('PRO'); localStorage.setItem('client_plan', 'PRO'); toast.success('Lizenz erfolgreich eingelöst! Du bist jetzt PRO. 🎉') }\n    else { toast.error(data.error || 'Ungültig'); setError(data.error || 'Ungültig') }")

# enable2FA
code = code.replace("if (res.ok) { setSuccessMsg(data.message); setTwoFaEnabled(true); setQrCode(''); setEnableCode('') }\n    else setError(data.error)", "if (res.ok) { toast.success(data.message); setTwoFaEnabled(true); setQrCode(''); setEnableCode('') }\n    else { toast.error(data.error); setError(data.error) }")

# disable2FA
code = code.replace("if (res.ok) { setSuccessMsg(data.message); setTwoFaEnabled(false); setDisablePassword('') }\n    else setError(data.error)", "if (res.ok) { toast.success(data.message); setTwoFaEnabled(false); setDisablePassword('') }\n    else { toast.error(data.error); setError(data.error) }")

# buyPro
code = code.replace("else setError(data.error || 'Checkout konnte nicht geladen werden. Ist Payment eingerichtet?')", "else { toast.error(data.error || 'Checkout konnte nicht geladen werden.'); setError(data.error || 'Checkout konnte nicht geladen werden.') }")

# generateMeme
code = code.replace("if (res.ok) setVideoResult(data)\n      else setError(data.error || 'Fehler')", "if (res.ok) { setVideoResult(data); toast.success('Video generiert!') }\n      else { toast.error(data.error || 'Fehler'); setError(data.error || 'Fehler') }")
code = code.replace("if (data.success) setVideoResult(data)\n      else setError(data.error)", "if (data.success) { setVideoResult(data); toast.success('Video generiert!') }\n      else { toast.error(data.error); setError(data.error) }")

# handleAuth
code = code.replace("""if (data.requires_2fa) {
        setTempToken(data.temp_token)
        setStep('2fa')
      } else if (res.ok && data.token) {
        saveSession(data)
      } else {
        setError(data.error || 'Fehler')
      }""", """if (data.requires_2fa) {
        setTempToken(data.temp_token)
        setStep('2fa')
      } else if (res.ok && data.token) {
        saveSession(data)
        toast.success(isLogin ? 'Erfolgreich eingeloggt!' : 'Account erstellt!')
      } else {
        toast.error(data.error || 'Fehler')
        setError(data.error || 'Fehler')
      }""")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
