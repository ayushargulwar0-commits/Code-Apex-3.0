const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'timer-state.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Helper: load state
function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading state file:', err.message);
  }
  // Default fallback state
  return {
    competition: {
      round1: {
        id: 'round1',
        name: 'ROUND 01',
        status: 'COMPLETE',
        statusText: 'COMPLETE',
        timeline: '10 - 11 OCTOBER 2026',
        format: 'Online Evaluation',
        description: 'Initial idea screening & architecture validation across participating collegiate teams.',
        completedAt: '2026-10-11T23:59:59+05:30'
      },
      round2: {
        id: 'round2',
        name: 'ROUND 02',
        status: 'IN PROGRESS',
        statusText: 'IN PROGRESS',
        timeline: '15 - 18 OCTOBER 2026',
        format: 'Online Evaluation',
        description: 'Deep-dive technical evaluation, prototype proof-of-concept, and mentorship review.',
        startedAt: '2026-10-15T00:00:00+05:30'
      },
      grandFinale: {
        id: 'grandFinale',
        name: 'GRAND FINALE',
        status: 'STANDBY',
        statusText: 'UPCOMING',
        timeline: '24 OCTOBER 2026',
        format: '24 Hours • Offline (VIT Bibwewadi Campus, Pune)',
        description: '24-Hour continuous onsite hackathon war-room. Assemble, build, and survive the protocol.'
      }
    },
    hodTimer: {
      status: 'STANDBY',
      isActive: false,
      isCompleted: false,
      durationMs: 86400000,
      activatedAt: null,
      activatedBy: null,
      expiresAt: null,
      lastAction: 'INITIALIZED',
      lastActionTimestamp: new Date().toISOString()
    },
    eventCountdown: {
      targetDate: '2026-10-26T00:00:00+05:30',
      title: 'CODEAPEX 3.0 PROTOCOL LAUNCH',
      posterGrandFinaleDate: '2026-10-24T09:00:00+05:30'
    },
    auditLog: []
  };
}

// Helper: save state
function saveState(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state file:', err.message);
  }
}

let appState = loadState();

// Broadcast state to all connected WS clients
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Periodically check if active 24-hr timer expired
setInterval(() => {
  if (appState.hodTimer.isActive && appState.hodTimer.expiresAt) {
    const now = Date.now();
    const expiry = new Date(appState.hodTimer.expiresAt).getTime();
    if (now >= expiry && !appState.hodTimer.isCompleted) {
      appState.hodTimer.isActive = false;
      appState.hodTimer.isCompleted = true;
      appState.hodTimer.status = 'PROTOCOL COMPLETE';
      appState.hodTimer.lastAction = 'COMPLETED';
      appState.hodTimer.lastActionTimestamp = new Date().toISOString();
      appState.auditLog.unshift({
        timestamp: new Date().toISOString(),
        event: 'PROTOCOL_COMPLETED',
        actor: 'SYSTEM_AUTOPILOT',
        details: '24-Hour Hackathon Mission Concluded. All builds locked.'
      });
      saveState(appState);
      broadcast({ type: 'TIMER_EXPIRED', state: appState });
    }
  }
}, 1000);

// API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    serverTime: new Date().toISOString(),
    serverTimestamp: Date.now(),
    state: appState
  });
});

// HOD Activation
// Authorized keys for Dr. Nilesh Sable / AISF Core
const VALID_PASSKEYS = ['DOOMSDAY-HOD-2026', 'NILESH-SABLE-CSEAI', 'AISF-WARROOM-VIT', 'DEMO-PASS'];

app.post('/api/hod/activate', (req, res) => {
  const { passkey, activatedBy = 'Dr. Nilesh Sable, HOD CSE(AI)' } = req.body;

  if (!passkey || !VALID_PASSKEYS.includes(passkey.trim().toUpperCase())) {
    return res.status(401).json({
      success: false,
      message: 'AUTHENTICATION_FAILED: Invalid HOD / Administrative authorization key.'
    });
  }

  // Prevent duplicate activation if already active
  if (appState.hodTimer.isActive) {
    return res.status(400).json({
      success: false,
      message: 'ALREADY_ACTIVE: The 24-Hour Protocol is currently in execution.',
      timer: appState.hodTimer
    });
  }

  const now = new Date();
  const durationMs = 24 * 60 * 60 * 1000; // 24 hours = 86,400,000 ms
  const expiresAt = new Date(now.getTime() + durationMs);

  appState.hodTimer = {
    status: 'PROTOCOL ACTIVE',
    isActive: true,
    isCompleted: false,
    durationMs,
    activatedAt: now.toISOString(),
    activatedBy: activatedBy.trim(),
    expiresAt: expiresAt.toISOString(),
    lastAction: 'ACTIVATED',
    lastActionTimestamp: now.toISOString()
  };

  appState.auditLog.unshift({
    timestamp: now.toISOString(),
    event: 'HOD_PROTOCOL_ACTIVATED',
    actor: activatedBy.trim(),
    details: `Official 24-Hour Hackathon Timer started. Termination at ${expiresAt.toISOString()}`
  });

  // Limit audit log length
  if (appState.auditLog.length > 50) {
    appState.auditLog = appState.auditLog.slice(0, 50);
  }

  saveState(appState);

  broadcast({
    type: 'TIMER_ACTIVATED',
    serverTimestamp: Date.now(),
    state: appState
  });

  return res.json({
    success: true,
    message: 'PROTOCOL_ACTIVATED: 24-Hour countdown officially authorized.',
    timer: appState.hodTimer
  });
});

// Authorized Reset
app.post('/api/hod/reset', (req, res) => {
  const { passkey } = req.body;

  if (!passkey || !VALID_PASSKEYS.includes(passkey.trim().toUpperCase())) {
    return res.status(401).json({
      success: false,
      message: 'AUTHENTICATION_FAILED: Admin authorization required to reset.'
    });
  }

  const now = new Date();
  appState.hodTimer = {
    status: 'STANDBY',
    isActive: false,
    isCompleted: false,
    durationMs: 86400000,
    activatedAt: null,
    activatedBy: null,
    expiresAt: null,
    lastAction: 'RESET',
    lastActionTimestamp: now.toISOString()
  };

  appState.auditLog.unshift({
    timestamp: now.toISOString(),
    event: 'HOD_PROTOCOL_RESET',
    actor: 'Authorized Administrator',
    details: '24-Hour timer reset to STANDBY state.'
  });

  saveState(appState);

  broadcast({
    type: 'TIMER_RESET',
    serverTimestamp: Date.now(),
    state: appState
  });

  return res.json({
    success: true,
    message: 'PROTOCOL_RESET: Timer returned to standby.',
    timer: appState.hodTimer
  });
});

// Competition Status Updater
app.post('/api/competition/status', (req, res) => {
  const { passkey, roundId, status, statusText } = req.body;

  if (!passkey || !VALID_PASSKEYS.includes(passkey.trim().toUpperCase())) {
    return res.status(401).json({
      success: false,
      message: 'AUTHENTICATION_FAILED: Admin authorization required to update competition status.'
    });
  }

  if (!roundId || !appState.competition[roundId]) {
    return res.status(400).json({
      success: false,
      message: `Invalid roundId. Valid options: ${Object.keys(appState.competition).join(', ')}`
    });
  }

  appState.competition[roundId].status = status;
  if (statusText) {
    appState.competition[roundId].statusText = statusText;
  }

  appState.auditLog.unshift({
    timestamp: new Date().toISOString(),
    event: 'COMPETITION_STATUS_UPDATED',
    actor: 'AISF Organizing Core',
    details: `Updated ${roundId} to status: ${status}`
  });

  saveState(appState);

  broadcast({
    type: 'STATUS_UPDATED',
    serverTimestamp: Date.now(),
    state: appState
  });

  return res.json({
    success: true,
    message: 'Competition status updated.',
    competition: appState.competition
  });
});

// WebSocket Connection Management
wss.on('connection', (ws) => {
  // Send current state on connection
  ws.send(JSON.stringify({
    type: 'INIT',
    serverTimestamp: Date.now(),
    serverTime: new Date().toISOString(),
    state: appState
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', serverTimestamp: Date.now() }));
      }
    } catch (e) {
      // Ignore malformed messages
    }
  });
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` [CODEAPEX 3.0] DOOMSDAY PROTOCOL MISSION CONTROL SERVER`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Timezone: IST (+05:30) | Persistent Storage: ${DATA_FILE}`);
  console.log(`=======================================================`);
});
