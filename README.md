# ⚡ MemeForge-AI Studio

> **KI-gestützte Meme & Video-Generierung** — Als lokale Desktop-App mit Cloud-Lizenzierung und GPU-Beschleunigung.

[![GitHub](https://img.shields.io/badge/Platform-Windows-blue?logo=windows)](https://github.com/Dinottinjs/MemeForge-AI)
[![License](https://img.shields.io/badge/Plan-Freemium-purple)](https://github.com/Dinottinjs/MemeForge-AI)

---

## 📥 Installation

Kein Programmierwissen oder Terminal nötig — lade einfach die Software herunter und starte sie!

### Windows
1. **Setup herunterladen** — Lade die neueste `MemeForge-AI Setup X.X.X.exe` aus dem Release-Tab auf GitHub herunter.
2. **Doppelklicken** — Die Setup-Datei installieren (wie jedes normale Programm).
3. **Fertig!** — Das Programm startet von selbst und legt ein Icon auf deinem Desktop ab! 🎉

---

## 🚀 So funktioniert's

### 1. 🔐 Account erstellen / Einloggen
Beim ersten Start einfach einen neuen Account mit E-Mail, Benutzername und Passwort erstellen. Deine Daten werden sicher auf unserem Server gespeichert — du kannst dich von jedem Gerät aus einloggen, ohne Daten zu verlieren.

### 2. 🔑 2-Faktor-Authentifizierung (optional, empfohlen)
Unter **Einstellungen → 2FA einrichten** kannst du deinen Account mit einer Authenticator-App (Google Authenticator, Authy, Microsoft Authenticator) sichern. QR-Code scannen → Code eingeben → fertig!

### 3. 💎 PRO-Lizenz aktivieren
Du startest im **FREE**-Modus. Um die volle GPU-Power zu nutzen:
- Gib deinen `PRO`-Lizenzschlüssel im gelben Banner ein
- Dein Rang aktualisiert sich **live per WebSocket** — kein Neustart nötig!

### 4. 🎨 AI Viral Meme generieren
1. Wähle deine Grafikkarte aus dem **GPU-Dropdown** (nur PRO)
2. Gib deinen Prompt ein (z.B. *"Tanzende Katze im Weltraum"*)
3. Klicke auf **✨ Meme generieren**
4. Die KI-Engine rendert das Meme blitzschnell auf deiner GPU!

---

## 💡 Features

| Feature | FREE | PRO |
|---|---|---|
| Account & Login | ✅ | ✅ |
| 2FA Authentifizierung | ✅ | ✅ |
| Account-Einstellungen | ✅ | ✅ |
| Viral Meme generieren (Server) | ✅ | ✅ |
| Lokales GPU-Rendering | ❌ | ✅ |
| GPU-Auswahl (eigene Hardware) | ❌ | ✅ |
| Live-Plan Upgrade (WebSocket) | ✅ | ✅ |
| Unbegrenzte Generierungen | ❌ | ✅ |

---

## 🎨 Design

- **Glassmorphism Dark Theme** — modernes, mattes UI mit Tiefenwirkung
- **Neon Glow Badges** — animierte Rang-Anzeige (FREE / PRO)
- **GPU-Auswahl Dropdown** — zeigt Grafikkarte, Hersteller & VRAM
- **Live-Animationen** — flüssige Übergänge und Mikro-Animationen

---

## 🔒 Sicherheit

- 🔐 Passwörter werden mit **Argon2** gehasht (serverseitig)
- 🛡️ JWT-basierte Authentifizierung mit 24h Ablauf
- 📲 TOTP-2FA (RFC 6238) — kompatibel mit allen gängigen Authenticator-Apps
- ⏱️ **Account Lockout** nach 5 Fehlversuchen (15 Minuten)
- 🚫 Rate Limiting auf allen Auth-Endpoints

---

## 🖥️ Systemanforderungen

| Komponente | Minimum |
|---|---|
| OS | Windows 10 / 11 |
| RAM | 4 GB |
| Speicher | 500 MB |
| GPU (für PRO) | NVIDIA / AMD mit CUDA/OpenCL |
| Node.js | v20+ (wird automatisch geprüft) |
| Python | 3.8+ (für KI-Engine) |
| Internet | Für Account & Lizenz-Validierung |

---

## 📁 Dateistruktur

```text
MemeForge-AI/
├── local_image_generator.py  ← Lokale KI-Engine (GPU)
├── electron/           ← Desktop App (Main Process & IPC)
├── src/                ← Haupt-UI (React Frontend)
└── dist/               ← Fertige Setup .exe (nach Build)
```

---

*Copyright © 2026 Dinottinjs — Alle Rechte vorbehalten.*
