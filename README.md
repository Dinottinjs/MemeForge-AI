# ⚡ MemeForge-AI Studio

> **KI-gestützte Meme & Video-Generierung** — Als lokale Desktop-App mit Cloud-Lizenzierung und GPU-Beschleunigung.

[![GitHub](https://img.shields.io/badge/Platform-Windows-blue?logo=windows)](https://github.com/Dinottinjs/MemeForge-AI)
[![License](https://img.shields.io/badge/Plan-Freemium-purple)](https://github.com/Dinottinjs/MemeForge-AI)

---

## 📥 Installation

Kein Programmierwissen nötig — ein Doppelklick reicht!

### Windows
1. **Repository herunterladen** — Lade den gesamten Ordner auf deinen PC herunter.
2. **`DEPLOY.bat` doppelklicken** — Das Skript installiert vollautomatisch alle Abhängigkeiten und startet die App. 🖱️
3. **Fertig!** — Das Programm öffnet sich von selbst. 🎉

> 💡 **Tipp:** Beim nächsten Start einfach `LAUNCH.bat` doppelklicken — das startet die App sofort ohne erneute Installation.

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

### 4. 🎬 Video generieren
1. Wähle deine Grafikkarte aus dem **GPU-Dropdown** (nur PRO)
2. Gib deinen Prompt ein (z.B. *"Tanzende Katze im Weltraum"*)
3. Klicke auf **✨ Video generieren**
4. Die KI-Engine rendert das Video lokal auf deiner GPU!

---

## 💡 Features

| Feature | FREE | PRO |
|---|---|---|
| Account & Login | ✅ | ✅ |
| 2FA Authentifizierung | ✅ | ✅ |
| Account-Einstellungen | ✅ | ✅ |
| Video generieren (Server) | ✅ | ✅ |
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

```
MemeForge-AI/
├── DEPLOY.bat          ← Erstinstallation & Start
├── LAUNCH.bat          ← Schnellstart nach Installation
├── local_generator.py  ← Lokale KI-Engine (GPU)
├── electron/           ← Desktop App (Electron)
│   └── main.ts         ← Hardware-Detection & IPC
└── src/
    └── App.tsx         ← Haupt-UI (React)
```

---

*Copyright © 2026 Dinottinjs — Alle Rechte vorbehalten.*
