# CODEAPEX 3.0 — DOOMSDAY PROTOCOL
### Cinematic Superhero Experience & Complete Hackathon Mission Control
**AISF × Department of Computer Science & Engineering (Artificial Intelligence)**  
**Vishwakarma Institute of Technology (VIT), Pune**

---

## ⚡ Overview

**CODEAPEX 3.0: DOOMSDAY PROTOCOL** is a 24-hour hackathon website built with an immersive Marvel Studios-style cinematic opening experience synchronized with the official Marvel Opening Theme soundtrack. The web experience is designed to make visitors feel as if they are entering a superhero movie before reaching the hackathon briefing and mission control.

- **Theme Quote:** *“The End Is Coming. Build Before It Does.”*
- **Total Prize Pool:** ₹2,00,000/- (Cash Prizes, Swag, Mentorship & Internship Opportunities)
- **Format:** 24-Hour Offline Hackathon at VIT Bibwewadi Campus, Pune
- **Team Size:** 1 – 4 Operatives

---

## 🛡️ Key Features & Marvel Cinematic Architecture

### 1. Marvel Studios-Style Cinematic Opening Sequence
- **Scene 1 — Darkness & Suspense (0.0s – 2.0s):** Ambient quantum dust particles and green arc-reactor pulse in pitch-black space, accompanied by the mysterious opening strings swell.
- **Scene 2 — Rapid 3D Comic Page & Code Flipping (2.0s – 5.8s):** Themed holographic comic dossiers flip rapidly through 3D perspective space with light flashes, schematics, and code shards as the percussion begins building.
- **Scene 3 — Main Title Reveal: CODEAPEX 3.0 (6.0s – 8.8s):** Right as the triumphant Marvel horn fanfare drops, the comic stream clears, and **CODEAPEX 3.0** zooms into the center with heavy chrome bevels, specular flare, shockwave ring, and cinematic impact.
- **Scene 4 — Subtitle & Tagline (8.8s – 11.8s):** Subtitle **DOOMSDAY PROTOCOL** reveals with a laser sweep wipe, followed by the glowing tagline *“THE END IS COMING. BUILD BEFORE IT DOES.”*
- **Scene 5 — Seamless Transition (12.5s):** The camera pushes smoothly through into the tactical landing page. The soundtrack continues playing without interruption or restart.
- **Mandatory Intro (No Skip):** No skip button, no close button, and keyboard/click dismissals are blocked. The intro plays through to completion once per page load. A fail-safe timer (15s) guarantees the landing page always becomes accessible.

### 2. Uploaded Marvel Opening Theme Soundtrack
- **Soundtrack Asset:** `assets/marvel-opening-theme.mp3` (mirrored in `public/assets/marvel-opening-theme.mp3`).
- **Reference Video:** `assets/marvel-opening-reference.mp4` (mirrored in `public/assets/marvel-opening-reference.mp4`).
- **Autoplay Handling:** Attempts autoplay on page load; if blocked by the browser, displays a high-tech **TAP TO INITIATE** reactor prompt to start audio and the cinematic animation simultaneously.
- **Audio Continuity:** The soundtrack keeps playing into the main website without restart or interruption. Discreet HUD mute/unmute and volume controls remain accessible on the navbar.

### 3. Live Event Launch Countdown
- **Target Timestamp:** `2026-10-26T00:00:00+05:30` (India Standard Time).
- Real-time Days, Hours, Minutes, Seconds display.
- **Zero-State Message:** Displays **THE PROTOCOL HAS BEGUN** upon reaching zero.
- **Organizer Dispatch Banner:** Prominently highlights the schedule alignment between the website launch countdown (26 Oct 2026) and the poster Grand Finale date (24 Oct 2026), with a one-click toggle to preview either countdown.

### 4. 24-Hour Hackathon Timer & ⚡ HOD Activation System
- **Independent 24H Clock:** Displays Hours, Minutes, Seconds, and Milliseconds (`HH:MM:SS:mmm`).
- **Persistent Backend:** Timer state is stored in `data/timer-state.json` and synchronized in real-time across all connected clients via WebSockets (`ws`). Refreshing the browser does not reset the timer.
- **⚡ HOD Activation Workflow:**
  1. Click **⚡ HOD ACTIVATION**.
  2. Opens classified security modal for **Dr. Nilesh Sable (HOD CSE-AI)**.
  3. Validates administrative passkey (`DOOMSDAY-HOD-2026`).
  4. Records start time and 24-hour end time in IST.
  5. Prevents duplicate activations.
  6. Displays a full-screen **PROTOCOL ACTIVATED** emergency strobe alert.
  7. Displays **PROTOCOL COMPLETE** when the 24 hours elapse.
  8. Includes an authorized admin reset function.

### 5. Competition Status Tracker
- **ROUND 01:** Status: **COMPLETE** (10–11 October 2026, Online Evaluation) with green badge and verified checkmark.
- **ROUND 02:** Status: **IN PROGRESS** (15–18 October 2026, Online Evaluation) with pulsing radar sweep and amber indicator.
- **GRAND FINALE:** Status: **UPCOMING / STANDBY** (24 October 2026, 24 Hours Offline, VIT Bibwewadi).
- Includes an **Organizer Mission Dashboard** to update status values live across all visitor screens.

### 6. Official Hackathon Poster & Lightbox
- High-fidelity display of the official poster (`assets/poster.jpg`).
- Interactive 3D perspective tilt on mouse movement.
- Holographic scanline animation with tactical glowing borders and corner brackets.
- Lightbox zoom modal to inspect the poster, QR code, and details at full resolution.

### 7. Event Information & Mission Dossier
- Team Size: 1–4 Members
- Registration Fee: VIT Students ₹300 | Non-VIT ₹300 + GST
- Total Prize Pool: ₹2,00,000/- (Cash Prizes, Goodies & Swag, Mentorship, Internship Opportunities)
- 5 Problem Tracks (AI Agents, Cybersecurity, Smart Systems, Disaster Response / ARES, Open Innovation)
- Command Leadership & Organizing Committee Contacts (Samarth Mahajan, Vedant Nehe, `aisf@vit.edu`, `@csai_aisf`)
- Rules of Engagement & FAQ Accordion

---

## 🚀 Quick Start & Deployment

### Prerequisites
- Node.js (v18+ recommended, v24+ supported)
- npm

### Installation
```bash
# Navigate to project directory
cd "C:\Users\ayush\.gemini\antigravity\scratch\codeapex-3.0"

# Install dependencies
npm install

# Start Mission Control Server
npm start
```

Open your browser at:
```
http://localhost:3000
```

### Standalone / Static Hosting (GitHub Pages / Vercel)
The project is built with progressive enhancement. If hosted on a static web server without Node.js, it automatically operates in **Standalone Evaluation Mode**, saving HOD timer state and competition progress to `localStorage`.

---

## 🔑 Administrative Passkeys (for Evaluation / Demo)

| Purpose | Passkey | Officer Clearance |
| :--- | :--- | :--- |
| **HOD Activation** | `DOOMSDAY-HOD-2026` | Dr. Nilesh Sable, HOD CSE(AI) |
| **Alternative Key** | `NILESH-SABLE-CSEAI` | AISF Faculty Advisor |
| **Organizer Control** | `AISF-WARROOM-VIT` | AISF Core Organizing Team |

*(A one-click helper button is also provided in the HOD Activation modal for rapid reviewer evaluation).*

---

## 📁 Project Structure

```
codeapex-3.0/
├── assets/
│   ├── poster.jpg                     # Official hackathon poster
│   ├── avengers-theme-licensed.mp3   # Configurable soundtrack (heroic orchestral score)
│   ├── sfx-impact.mp3                 # Title reveal sub-boom impact
│   ├── sfx-activate.mp3               # HOD activation tactical alarm
│   └── sfx-beep.mp3                   # UI interactive click / feedback
├── data/
│   └── timer-state.json               # Persistent backend state (HOD timer, status, audit log)
├── scripts/
│   ├── generate_audio.js              # Superhero orchestral score synthesizer
│   ├── generate_sfx.js                # UI sound effects generator
│   └── test_api.js                    # Automated API & persistence test suite
├── index.html                         # Semantic HTML5 architecture & accessibility
├── style.css                          # Visual identity, 3D animations, tactical HUD
├── app.js                             # Audio-visual sync, countdown, WebSockets, kinetics
├── server.js                          # Express & WebSocket synchronization backend
└── package.json                       # Project dependencies & scripts
```

---

## 🎓 Credits & Patronage
- **Director:** Dr. (Prof.) R.M. Jalnekar, Director, VIT Pune
- **HOD:** Dr. Nilesh Sable, HOD CSE (Artificial Intelligence)
- **AISF Coordinator:** Prof. Jayshree Bedade
- **Hackathon Coordinator:** Prof. Roshani Pawar
- **AISF Leadership:** Samarth Mahajan (President), Vedant Nehe (Vice President)
- **Organized by:** Artificial Intelligence Student Forum (AISF), Vishwakarma Institute of Technology, Pune
