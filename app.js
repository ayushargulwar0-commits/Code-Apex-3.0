/**
 * CODEAPEX 3.0 — DOOMSDAY PROTOCOL
 * Official Hackathon Frontend Architecture & Mission Control Engine
 * AISF × Dept. of CSE (AI), Vishwakarma Institute of Technology, Pune
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // =========================================================================
  const CONFIG = {
    // Official Assets
    POSTER_IMAGE_URL: 'assets/poster.jpg', // Easy to change or replace placeholder
    SOUNDTRACK_URL: 'assets/marvel-opening-theme.mp3',

    // Targets relative to India Standard Time (IST: UTC+05:30)
    LAUNCH_COUNTDOWN_TARGET: '2026-10-26T00:00:00+05:30',
    POSTER_GRAND_FINALE_TARGET: '2026-10-24T09:00:00+05:30',

    // 24 Hours in Milliseconds = 86,400,000 ms
    DURATION_24H_MS: 24 * 60 * 60 * 1000,

    // Authorized Security Passkeys for HOD / AISF Core
    VALID_PASSKEYS: ['DOOMSDAY-HOD-2026', 'NILESH-SABLE-CSEAI', 'AISF-WARROOM-VIT', 'DEMO-PASS']
  };

  // State Management
  const state = {
    introActive: false,
    introCompleted: false,
    audioInitialized: false,
    audioPlaying: false,
    audioMuted: false,
    currentTarget: CONFIG.LAUNCH_COUNTDOWN_TARGET,
    currentTargetLabel: '26 OCT (OFFICIAL LAUNCH)',

    // Backend Synchronized State
    wsConnected: false,
    serverTimestampOffset: 0,
    hodTimer: {
      status: 'STANDBY',
      isActive: false,
      isCompleted: false,
      durationMs: CONFIG.DURATION_24H_MS,
      activatedAt: null,
      activatedBy: null,
      expiresAt: null
    },
    competition: {
      round1: { status: 'COMPLETE', statusText: 'COMPLETE' },
      round2: { status: 'IN PROGRESS', statusText: 'IN PROGRESS' },
      grandFinale: { status: 'STANDBY', statusText: 'UPCOMING' }
    }
  };

  // Audio Context for Web Audio Unlock
  let audioCtx = null;

  // =========================================================================
  // 2. DOM ELEMENT REFS
  // =========================================================================
  const dom = {
    // Intro
    introSection: document.getElementById('cinematic-intro'),
    introStage: document.getElementById('intro-stage'),
    marvelTitlePlate: document.getElementById('marvel-title-plate'),
    introMainTitle: document.getElementById('intro-main-title'),
    introSubBlock: document.getElementById('intro-sub-block'),
    introTagline: document.getElementById('intro-tagline'),
    introFlash: document.getElementById('intro-flash'),
    introShockwave: document.getElementById('intro-shockwave'),
    btnReplayIntroNav: document.getElementById('btn-replay-intro'),
    btnReplayIntroHero: document.getElementById('hero-btn-replay'),
    autoplayPrompt: document.getElementById('autoplay-prompt'),
    btnInitiateAudio: document.getElementById('btn-initiate-audio'),

    // Audio HUD (Only Uploaded Marvel Theme)
    audioElement: document.getElementById('bg-soundtrack'),
    audioHud: document.getElementById('audio-hud'),
    btnAudioToggle: document.getElementById('btn-audio-toggle'),
    btnAudioMute: document.getElementById('btn-audio-mute'),
    iconPlay: document.getElementById('audio-icon-play'),
    iconPause: document.getElementById('audio-icon-pause'),
    iconVolume: document.getElementById('audio-icon-volume'),
    iconMuted: document.getElementById('audio-icon-muted'),

    // Navigation & Telemetry
    navMenu: document.getElementById('nav-menu'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    teleClock: document.getElementById('tele-live-clock'),
    teleSyncText: document.getElementById('tele-sync-text'),
    teleSyncDot: document.getElementById('tele-sync-dot'),
    footerClock: document.getElementById('footer-ist-clock'),

    // Dispatch Banner
    organizerAlert: document.getElementById('organizer-alert'),
    btnToggleTarget: document.getElementById('btn-toggle-countdown-target'),
    targetToggleLabel: document.getElementById('target-toggle-label'),
    btnDismissDispatch: document.getElementById('btn-dismiss-dispatch'),

    // Event Countdown
    cdDays: document.getElementById('cd-days'),
    cdHours: document.getElementById('cd-hours'),
    cdMinutes: document.getElementById('cd-minutes'),
    cdSeconds: document.getElementById('cd-seconds'),
    countdownTargetDisplay: document.getElementById('countdown-target-display'),
    countdownFinishedBanner: document.getElementById('countdown-finished-banner'),

    // 24H War Room & HOD Timer
    warroomSyncStatus: document.getElementById('warroom-sync-status'),
    warroomSyncSub: document.getElementById('warroom-sync-sub'),
    warroomSyncLed: document.getElementById('warroom-sync-led'),
    hodTimerStatusText: document.getElementById('hod-timer-status-text'),
    timerStatusChip: document.getElementById('timer-status-chip'),
    hodActivatedBy: document.getElementById('hod-activated-by'),
    hodStartTime: document.getElementById('hod-start-time'),
    hodEndTime: document.getElementById('hod-end-time'),
    timerHours: document.getElementById('timer-24-hours'),
    timerMinutes: document.getElementById('timer-24-minutes'),
    timerSeconds: document.getElementById('timer-24-seconds'),
    timerMs: document.getElementById('timer-24-ms'),
    protocolCompleteBanner: document.getElementById('protocol-complete-banner'),
    btnNavHod: document.getElementById('btn-nav-hod'),
    btnHodActivate: document.getElementById('btn-hod-activate'),
    btnHodReset: document.getElementById('btn-hod-reset'),

    // Modals
    modalHod: document.getElementById('modal-hod'),
    btnCloseHodModal: document.getElementById('btn-close-hod-modal'),
    btnCancelHod: document.getElementById('btn-cancel-hod'),
    formHodActivate: document.getElementById('form-hod-activate'),
    inputHodPasskey: document.getElementById('input-hod-passkey'),
    inputHodName: document.getElementById('input-hod-name'),
    btnAutofillKey: document.getElementById('btn-autofill-key'),
    hodModalAlert: document.getElementById('hod-modal-alert'),

    // Authorized Reset Modal
    modalHodReset: document.getElementById('modal-hod-reset'),
    btnCloseResetModal: document.getElementById('btn-close-reset-modal'),
    btnCancelReset: document.getElementById('btn-cancel-reset'),
    formHodReset: document.getElementById('form-hod-reset'),
    inputResetPasskey: document.getElementById('input-reset-passkey'),
    btnAutofillResetKey: document.getElementById('btn-autofill-reset-key'),
    resetModalAlert: document.getElementById('reset-modal-alert'),

    // Competition Status
    statusTextRound1: document.getElementById('status-text-round1'),
    statusTextRound2: document.getElementById('status-text-round2'),
    statusTextGrandFinale: document.getElementById('status-text-grandfinale'),
    btnOpenAdminDrawer: document.getElementById('btn-open-admin-drawer'),
    modalAdmin: document.getElementById('modal-admin'),
    btnCloseAdminModal: document.getElementById('btn-close-admin-modal'),
    btnCancelAdmin: document.getElementById('btn-cancel-admin'),
    formAdminStatus: document.getElementById('form-admin-status'),
    adminSelectRound: document.getElementById('admin-select-round'),
    adminSelectStatus: document.getElementById('admin-select-status'),
    adminPasskey: document.getElementById('admin-passkey'),
    adminModalAlert: document.getElementById('admin-modal-alert'),

    // Poster & Lightbox
    posterTiltCard: document.getElementById('poster-tilt-card'),
    btnZoomPoster: document.getElementById('btn-zoom-poster'),
    modalPosterLightbox: document.getElementById('modal-poster-lightbox'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),

    // Emergency Strobe Alert
    cinematicAlertOverlay: document.getElementById('cinematic-alert-overlay'),
    strobeTitle: document.getElementById('strobe-title'),
    strobeSubtitle: document.getElementById('strobe-subtitle'),
    strobeTimer: document.getElementById('strobe-timer'),

    // Ambient Canvas
    ambientCanvas: document.getElementById('ambient-canvas')
  };

  // =========================================================================
  // 3. SOUNDTRACK & AUDIO ENGINE (ONLY UPLOADED MARVEL THEME)
  // =========================================================================

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Smooth Audio Fade In
  function fadeAudioIn(audioEl, targetVol = 0.85, durationMs = 2000) {
    if (!audioEl) return;
    audioEl.volume = 0;
    const stepMs = 50;
    const stepCount = durationMs / stepMs;
    const volStep = targetVol / stepCount;
    let currentVol = 0;

    const fadeInterval = setInterval(() => {
      currentVol = Math.min(targetVol, currentVol + volStep);
      audioEl.volume = currentVol;
      if (currentVol >= targetVol) {
        clearInterval(fadeInterval);
      }
    }, stepMs);
  }

  // Main Audio Playback Trigger
  async function attemptAudioPlayback() {
    initAudioContext();
    if (!dom.audioElement) return false;

    try {
      dom.audioElement.volume = 0;
      const playPromise = dom.audioElement.play();

      if (playPromise !== undefined) {
        await playPromise;
        // Autoplay succeeded!
        state.audioPlaying = true;
        updateAudioHUDUI();
        fadeAudioIn(dom.audioElement, 0.85, 2500);
        return true;
      }
    } catch (err) {
      // Browser blocked autoplay
      console.warn('Browser autoplay prevented immediate playback. Showing user prompt.', err.name);
      return false;
    }
    return false;
  }

  function updateAudioHUDUI() {
    if (state.audioPlaying) {
      dom.iconPlay.style.display = 'none';
      dom.iconPause.style.display = 'inline-block';
      dom.audioHud.classList.add('audio-playing');
    } else {
      dom.iconPlay.style.display = 'inline-block';
      dom.iconPause.style.display = 'none';
      dom.audioHud.classList.remove('audio-playing');
    }

    if (state.audioMuted) {
      dom.iconVolume.style.display = 'none';
      dom.iconMuted.style.display = 'inline-block';
    } else {
      dom.iconVolume.style.display = 'inline-block';
      dom.iconMuted.style.display = 'none';
    }
  }

  function toggleAudioPlayPause() {
    initAudioContext();
    if (!dom.audioElement) return;

    if (dom.audioElement.paused) {
      dom.audioElement.play().then(() => {
        state.audioPlaying = true;
        updateAudioHUDUI();
      }).catch(err => {
        console.warn('Audio resume failed:', err);
      });
    } else {
      dom.audioElement.pause();
      state.audioPlaying = false;
      updateAudioHUDUI();
    }
  }

  function toggleAudioMute() {
    if (!dom.audioElement) return;
    dom.audioElement.muted = !dom.audioElement.muted;
    state.audioMuted = dom.audioElement.muted;
    updateAudioHUDUI();
  }

  // =========================================================================
  // 4. CINEMATIC INTRO TIMELINE CONTROLLER (MARVEL-STYLE CINEMATIC ENGINE)
  // =========================================================================
  let introTimer = null;

  function startCinematicIntro() {
    if (state.introActive) return;
    state.introActive = true;
    state.introCompleted = false;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      transitionIntroToWebsite();
      return;
    }

    // Reset UI stages
    dom.introSection.style.display = 'flex';
    dom.introSection.classList.remove('intro-fading', 'intro-hidden');
    if (dom.marvelTitlePlate) {
      dom.marvelTitlePlate.classList.remove('plate-revealed');
    }
    if (dom.introSubBlock) {
      dom.introSubBlock.classList.remove('sub-revealed');
    }
    if (dom.introTagline) {
      dom.introTagline.classList.remove('tagline-revealed');
    }
    if (dom.introFlash) {
      dom.introFlash.classList.remove('flash-active');
    }
    if (dom.introShockwave) {
      dom.introShockwave.classList.remove('shockwave-active');
    }

    const core = document.querySelector('.intro-energy-core');
    if (core) {
      core.classList.remove('core-visible');
      setTimeout(() => core.classList.add('core-visible'), 150);
    }

    // Fail-safe timer (guarantees website access even if hardware/timing delays occur)
    setTimeout(() => {
      if (state.introActive) {
        transitionIntroToWebsite();
      }
    }, 15000);

    // =======================================================================
    // CINEMATIC MARVEL TIMELINE
    // Synchronized with Marvel Opening Theme Brass Fanfare
    // =======================================================================

    // SCENE 1: Darkness & Anticipation (0.0s - 2.5s)
    // Ambient dust and green reactor core breathing in pitch black.

    // SCENE 2: Main Title Reveal — CODEAPEX 3.0 (3.6s)
    // Triumphant Marvel Brass Fanfare Crescendo Hits!
    setTimeout(() => {
      if (!state.introActive) return;
      triggerFlash(0.9);
      triggerShockwave();
      if (dom.marvelTitlePlate) {
        dom.marvelTitlePlate.classList.add('plate-revealed');
      }
    }, 3600);

    // SCENE 3: Subtitle Reveal (6.2s)
    setTimeout(() => {
      if (!state.introActive) return;
      if (dom.introSubBlock) {
        dom.introSubBlock.classList.add('sub-revealed');
      }
    }, 6200);

    // SCENE 4: Tagline Reveal (8.0s)
    setTimeout(() => {
      if (!state.introActive) return;
      if (dom.introTagline) {
        dom.introTagline.classList.add('tagline-revealed');
      }
    }, 8000);

    // SCENE 5: Transition into Landing Page (10.8s)
    // Camera pushes smoothly into the tactical command center
    // Soundtrack continues playing seamlessly without interruption!
    setTimeout(() => {
      if (!state.introActive) return;
      transitionIntroToWebsite();
    }, 10800);
  }

  function triggerFlash(intensity = 0.8) {
    if (!dom.introFlash) return;
    dom.introFlash.style.opacity = intensity;
    dom.introFlash.classList.add('flash-active');
    setTimeout(() => {
      dom.introFlash.classList.remove('flash-active');
      dom.introFlash.style.opacity = '0';
    }, 350);
  }

  function triggerShockwave() {
    if (!dom.introShockwave) return;
    dom.introShockwave.classList.remove('shockwave-active');
    void dom.introShockwave.offsetWidth; // trigger reflow
    dom.introShockwave.classList.add('shockwave-active');
  }

  function transitionIntroToWebsite() {
    if (state.introCompleted) return;
    state.introCompleted = true;
    state.introActive = false;

    if (introTimer) clearTimeout(introTimer);

    // Smooth camera push through title into main website
    dom.introSection.classList.add('intro-fading');
    setTimeout(() => {
      dom.introSection.classList.add('intro-hidden');
      dom.introSection.style.display = 'none';
    }, 1200);
  }

  function replayCinematicIntro() {
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dom.introSection.classList.remove('intro-hidden', 'intro-fading');
    dom.introSection.style.display = 'flex';
    dom.introSection.style.opacity = '1';
    dom.introSection.style.transform = 'scale(1)';

    if (dom.marvelTitlePlate) {
      dom.marvelTitlePlate.classList.remove('plate-revealed');
    }
    if (dom.introSubBlock) {
      dom.introSubBlock.classList.remove('sub-revealed');
    }
    if (dom.introTagline) {
      dom.introTagline.classList.remove('tagline-revealed');
    }

    // Play soundtrack from beginning if requested
    if (dom.audioElement) {
      dom.audioElement.currentTime = 0;
      dom.audioElement.play().then(() => {
        state.audioPlaying = true;
        updateAudioHUDUI();
      }).catch(() => {});
    }

    startCinematicIntro();
  }

  // =========================================================================
  // 5. EVENT COUNTDOWN CONTROLLER (26 OCTOBER 2026, 12:00 AM IST)
  // =========================================================================

  function updateEventCountdown() {
    const targetMs = new Date(state.currentTarget).getTime();
    const nowMs = Date.now();
    const diff = targetMs - nowMs;

    if (diff <= 0) {
      // Countdown reached zero!
      dom.cdDays.textContent = '00';
      dom.cdHours.textContent = '00';
      dom.cdMinutes.textContent = '00';
      dom.cdSeconds.textContent = '00';
      if (dom.countdownFinishedBanner) {
        dom.countdownFinishedBanner.style.display = 'block';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    dom.cdDays.textContent = String(days).padStart(2, '0');
    dom.cdHours.textContent = String(hours).padStart(2, '0');
    dom.cdMinutes.textContent = String(minutes).padStart(2, '0');
    dom.cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  function toggleCountdownTarget() {
    if (state.currentTarget === CONFIG.LAUNCH_COUNTDOWN_TARGET) {
      state.currentTarget = CONFIG.POSTER_GRAND_FINALE_TARGET;
      state.currentTargetLabel = '24 OCT (POSTER FINALE)';
    } else {
      state.currentTarget = CONFIG.LAUNCH_COUNTDOWN_TARGET;
      state.currentTargetLabel = '26 OCT (OFFICIAL LAUNCH)';
    }

    dom.targetToggleLabel.textContent = state.currentTargetLabel;
    dom.countdownTargetDisplay.textContent = state.currentTarget;
    updateEventCountdown();
  }

  // =========================================================================
  // 6. 24-HOUR HACKATHON TIMER & HOD ACTIVATION SYSTEM
  // =========================================================================

  function renderHodTimerUI() {
    const timer = state.hodTimer;

    // Status Banner & Badges
    if (timer.isCompleted) {
      dom.hodTimerStatusText.textContent = 'PROTOCOL COMPLETE';
      dom.timerStatusChip.className = 'status-indicator-chip';
      dom.timerStatusChip.style.color = 'var(--color-danger-crimson)';
      dom.protocolCompleteBanner.style.display = 'flex';
      dom.timerHours.textContent = '00';
      dom.timerMinutes.textContent = '00';
      dom.timerSeconds.textContent = '00';
      dom.timerMs.textContent = '000';
      return;
    }

    if (timer.isActive && timer.expiresAt) {
      dom.hodTimerStatusText.textContent = 'PROTOCOL ACTIVE (DEFCON-1)';
      dom.timerStatusChip.className = 'status-indicator-chip status-active';
      dom.timerStatusChip.style.color = 'var(--color-bright-green)';
      dom.protocolCompleteBanner.style.display = 'none';

      // Metadata
      dom.hodActivatedBy.textContent = timer.activatedBy || 'Dr. Nilesh Sable, HOD CSE(AI)';
      if (timer.activatedAt) {
        dom.hodStartTime.textContent = formatISTTime(timer.activatedAt);
      }
      if (timer.expiresAt) {
        dom.hodEndTime.textContent = formatISTTime(timer.expiresAt);
      }

      // Calculate remaining time
      const now = Date.now();
      const expiry = new Date(timer.expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);

      if (remaining <= 0) {
        timer.isActive = false;
        timer.isCompleted = true;
        renderHodTimerUI();
        return;
      }

      const hrs = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);
      const ms = Math.floor(remaining % 1000);

      dom.timerHours.textContent = String(hrs).padStart(2, '0');
      dom.timerMinutes.textContent = String(mins).padStart(2, '0');
      dom.timerSeconds.textContent = String(secs).padStart(2, '0');
      dom.timerMs.textContent = String(ms).padStart(3, '0');
    } else {
      // STANDBY STATE
      dom.hodTimerStatusText.textContent = 'STANDBY (AWAITING HOD AUTHORIZATION)';
      dom.timerStatusChip.className = 'status-indicator-chip';
      dom.timerStatusChip.style.color = 'var(--color-warning-amber)';
      dom.protocolCompleteBanner.style.display = 'none';
      dom.hodActivatedBy.textContent = '--';
      dom.hodStartTime.textContent = '--';
      dom.hodEndTime.textContent = '--';
      dom.timerHours.textContent = '24';
      dom.timerMinutes.textContent = '00';
      dom.timerSeconds.textContent = '00';
      dom.timerMs.textContent = '000';
    }
  }

  function formatISTTime(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' IST';
    } catch (e) {
      return isoString;
    }
  }

  // Trigger Fullscreen Cinematic Protocol Activated Emergency Strobe
  function showProtocolActivatedCinematicStrobe(officer = 'Dr. Nilesh Sable, HOD CSE(AI)') {
    dom.strobeTitle.textContent = 'PROTOCOL ACTIVATED';
    dom.strobeSubtitle.textContent = `OFFICIAL 24-HOUR TIMER COMMENCED BY ${officer.toUpperCase()}`;
    dom.strobeTimer.textContent = '24:00:00';
    dom.cinematicAlertOverlay.style.display = 'flex';

    setTimeout(() => {
      dom.cinematicAlertOverlay.style.display = 'none';
    }, 3800);
  }

  // HOD Activation Workflow
  async function submitHodActivation(passkey, activatedBy) {
    try {
      const res = await fetch('/api/hod/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey, activatedBy })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showModalAlert(dom.hodModalAlert, data.message || 'Authorization rejected.', 'alert-error');
        return;
      }

      // Success
      state.hodTimer = data.timer;
      showModalAlert(dom.hodModalAlert, 'AUTHORIZATION VERIFIED. ACTIVATING PROTOCOL...', 'alert-success');
      
      setTimeout(() => {
        closeHodModal();
        showProtocolActivatedCinematicStrobe(activatedBy);
        renderHodTimerUI();
      }, 700);

    } catch (err) {
      console.warn('Backend unavailable, engaging Local Demo Mode for evaluation:', err);
      // Local fallback execution for demo / standalone testing
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CONFIG.DURATION_24H_MS);

      state.hodTimer = {
        status: 'PROTOCOL ACTIVE',
        isActive: true,
        isCompleted: false,
        durationMs: CONFIG.DURATION_24H_MS,
        activatedAt: now.toISOString(),
        activatedBy: activatedBy || 'Dr. Nilesh Sable, HOD CSE(AI) [DEMO]',
        expiresAt: expiresAt.toISOString()
      };

      localStorage.setItem('codeapex_hod_timer', JSON.stringify(state.hodTimer));
      showModalAlert(dom.hodModalAlert, 'DEMO AUTHORIZATION ACCEPTED', 'alert-success');

      setTimeout(() => {
        closeHodModal();
        showProtocolActivatedCinematicStrobe(activatedBy);
        renderHodTimerUI();
      }, 700);
    }
  }

  // Authorized Reset Workflow
  function openResetModal() {
    if (dom.modalHodReset) {
      dom.modalHodReset.style.display = 'flex';
      if (dom.resetModalAlert) dom.resetModalAlert.style.display = 'none';
      if (dom.inputResetPasskey) {
        dom.inputResetPasskey.value = '';
        dom.inputResetPasskey.focus();
      }
    }
  }

  function closeResetModal() {
    if (dom.modalHodReset) {
      dom.modalHodReset.style.display = 'none';
    }
  }

  async function submitHodReset(passkey) {
    if (!passkey || !passkey.trim()) {
      showModalAlert(dom.resetModalAlert, 'Please enter an authorized security passkey.', 'alert-error');
      return;
    }

    showModalAlert(dom.resetModalAlert, 'VERIFYING SECURITY AUTHORIZATION...', 'alert-info');

    try {
      const res = await fetch('/api/hod/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        state.hodTimer = data.timer;
        localStorage.removeItem('codeapex_hod_timer');
        renderHodTimerUI();
        showModalAlert(dom.resetModalAlert, 'PROTOCOL RESET COMPLETED. TIMER RETURNED TO STANDBY.', 'alert-success');
        setTimeout(() => {
          closeResetModal();
        }, 800);
      } else {
        showModalAlert(dom.resetModalAlert, data.message || 'Authorization rejected. Invalid security passkey.', 'alert-error');
      }
    } catch (e) {
      console.warn('Backend unavailable, executing local reset:', e);
      // Local fallback reset
      state.hodTimer = {
        status: 'STANDBY',
        isActive: false,
        isCompleted: false,
        durationMs: CONFIG.DURATION_24H_MS,
        activatedAt: null,
        activatedBy: null,
        expiresAt: null
      };
      localStorage.removeItem('codeapex_hod_timer');
      renderHodTimerUI();
      showModalAlert(dom.resetModalAlert, 'STANDALONE RESET COMPLETED (STANDBY).', 'alert-success');
      setTimeout(() => {
        closeResetModal();
      }, 800);
    }
  }

  function showModalAlert(alertEl, msg, typeClass) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.className = `modal-alert ${typeClass}`;
    alertEl.style.display = 'block';
  }

  function openHodModal() {
    dom.modalHod.style.display = 'flex';
    dom.hodModalAlert.style.display = 'none';
    dom.inputHodPasskey.focus();
  }

  function closeHodModal() {
    dom.modalHod.style.display = 'none';
  }

  // =========================================================================
  // 7. COMPETITION STATUS TRACKER & ADMIN DASHBOARD
  // =========================================================================

  function renderCompetitionStatusUI() {
    const comp = state.competition;
    if (comp.round1 && dom.statusTextRound1) {
      dom.statusTextRound1.textContent = comp.round1.statusText || comp.round1.status;
    }
    if (comp.round2 && dom.statusTextRound2) {
      dom.statusTextRound2.textContent = comp.round2.statusText || comp.round2.status;
    }
    if (comp.grandFinale && dom.statusTextGrandFinale) {
      dom.statusTextGrandFinale.textContent = comp.grandFinale.statusText || comp.grandFinale.status;
    }
  }

  async function submitAdminStatusUpdate(roundId, status, passkey) {
    try {
      const res = await fetch('/api/competition/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId, status, passkey })
      });
      const data = await res.json();
      if (data.success) {
        state.competition = data.competition;
        renderCompetitionStatusUI();
        showModalAlert(dom.adminModalAlert, 'Status successfully broadcasted!', 'alert-success');
        setTimeout(() => {
          dom.modalAdmin.style.display = 'none';
        }, 800);
      } else {
        showModalAlert(dom.adminModalAlert, data.message || 'Update failed', 'alert-error');
      }
    } catch (err) {
      // Local demo mode
      state.competition[roundId].status = status;
      state.competition[roundId].statusText = status;
      renderCompetitionStatusUI();
      showModalAlert(dom.adminModalAlert, 'Demo status updated locally!', 'alert-success');
      setTimeout(() => {
        dom.modalAdmin.style.display = 'none';
      }, 800);
    }
  }

  // =========================================================================
  // 8. WEBSOCKET REAL-TIME SERVER SYNCHRONIZATION
  // =========================================================================

  function initWebSocketSync() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (e) {
      console.log('Standalone mode: WebSocket not available on static host.');
      return;
    }

    socket.onopen = () => {
      state.wsConnected = true;
      dom.teleSyncText.textContent = 'SERVER LINKED';
      dom.teleSyncDot.className = 'status-pulse-dot active';
      dom.warroomSyncStatus.textContent = 'PERSISTENT BACKEND LINKED';
      dom.warroomSyncSub.textContent = 'SYNCHRONIZED ACROSS ALL SESSIONS';
      dom.warroomSyncLed.style.background = 'var(--color-bright-green)';
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INIT' || msg.type === 'TIMER_ACTIVATED' || msg.type === 'TIMER_RESET' || msg.type === 'TIMER_EXPIRED') {
          if (msg.state) {
            state.hodTimer = msg.state.hodTimer || state.hodTimer;
            state.competition = msg.state.competition || state.competition;
            renderHodTimerUI();
            renderCompetitionStatusUI();
          }
        }
        if (msg.type === 'STATUS_UPDATED' && msg.state) {
          state.competition = msg.state.competition || state.competition;
          renderCompetitionStatusUI();
        }
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    socket.onclose = () => {
      state.wsConnected = false;
      dom.teleSyncText.textContent = 'DEMO LOCAL SYNC';
      dom.warroomSyncStatus.textContent = 'DEMO LOCAL STORAGE SYNC';
      dom.warroomSyncSub.textContent = 'RUNNING STANDALONE MODE';
      dom.warroomSyncLed.style.background = 'var(--color-warning-amber)';
      // Reconnect attempt after 5s
      setTimeout(initWebSocketSync, 5000);
    };
  }

  // Initial REST fetch to populate persistent state
  async function fetchServerStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          state.hodTimer = data.state.hodTimer || state.hodTimer;
          state.competition = data.state.competition || state.competition;
          renderHodTimerUI();
          renderCompetitionStatusUI();
        }
      }
    } catch (e) {
      // Check localStorage for standalone fallback
      const savedTimer = localStorage.getItem('codeapex_hod_timer');
      if (savedTimer) {
        try {
          state.hodTimer = JSON.parse(savedTimer);
          renderHodTimerUI();
        } catch (err) {}
      }
    }
  }

  // =========================================================================
  // 9. ATMOSPHERIC PARTICLE & QUANTUM DUST CANVAS
  // =========================================================================

  function initAmbientCanvas() {
    const canvas = dom.ambientCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(65, Math.floor(width / 25));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2, // drifting upward
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.3 ? '#5DFF63' : '#9CFF8A'
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // =========================================================================
  // 10. POSTER 3D INTERACTIVE TILT & LIGHTBOX
  // =========================================================================

  function initPosterTilt() {
    const card = dom.posterTiltCard;
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / (rect.height / 2)) * 7;
      const rotateY = (x / (rect.width / 2)) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  window.handlePosterError = function (imgElement) {
    if (!imgElement) return;
    imgElement.style.display = 'none';
    const fallback = document.getElementById('poster-fallback-message');
    if (fallback) fallback.style.display = 'block';
  };

  // =========================================================================
  // 11. LIVE IST CLOCK TICKER
  // =========================================================================

  function updateLiveClocks() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';

    if (dom.teleClock) dom.teleClock.textContent = timeStr;
    if (dom.footerClock) dom.footerClock.textContent = timeStr;
  }

  // =========================================================================
  // 12. EVENT LISTENERS & BOOTSTRAP
  // =========================================================================

  function setupEventListeners() {
    // Replay Intro from Navbar and Hero
    dom.btnReplayIntroNav.addEventListener('click', replayCinematicIntro);
    dom.btnReplayIntroHero.addEventListener('click', replayCinematicIntro);

    // Prevent dismissals during mandatory cinematic intro
    if (dom.introSection) {
      dom.introSection.addEventListener('click', (e) => {
        // Prevent background clicks from dismissing intro
        e.stopPropagation();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (state.introActive && (e.key === 'Escape' || e.keyCode === 27)) {
        // Prevent Escape key from dismissing intro
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!state.introActive && (e.key === 'Escape' || e.keyCode === 27)) {
        if (dom.modalHodReset && dom.modalHodReset.style.display !== 'none') {
          closeResetModal();
        } else if (dom.modalHod && dom.modalHod.style.display !== 'none') {
          closeHodModal();
        } else if (dom.modalAdmin && dom.modalAdmin.style.display !== 'none') {
          dom.modalAdmin.style.display = 'none';
        } else if (dom.modalPosterLightbox && dom.modalPosterLightbox.style.display !== 'none') {
          dom.modalPosterLightbox.style.display = 'none';
        }
      }
    }, true);

    // Autoplay Modal Initiator (when browser blocks unmuted audio on load)
    dom.btnInitiateAudio.addEventListener('click', () => {
      dom.autoplayPrompt.style.display = 'none';
      if (dom.audioElement) {
        dom.audioElement.play().then(() => {
          state.audioPlaying = true;
          updateAudioHUDUI();
        }).catch((err) => {
          console.warn('Audio playback failed on initiate:', err);
        });
      }
      startCinematicIntro();
    });

    // Audio HUD Controls
    dom.btnAudioToggle.addEventListener('click', toggleAudioPlayPause);
    dom.btnAudioMute.addEventListener('click', toggleAudioMute);

    // Countdown Toggle & Dismiss
    dom.btnToggleTarget.addEventListener('click', toggleCountdownTarget);
    dom.btnDismissDispatch.addEventListener('click', () => {
      dom.organizerAlert.style.display = 'none';
    });

    // HOD Activation Modals
    dom.btnNavHod.addEventListener('click', openHodModal);
    dom.btnHodActivate.addEventListener('click', openHodModal);
    dom.btnCloseHodModal.addEventListener('click', closeHodModal);
    dom.btnCancelHod.addEventListener('click', closeHodModal);
    dom.btnAutofillKey.addEventListener('click', () => {
      dom.inputHodPasskey.value = 'DOOMSDAY-HOD-2026';
    });

    dom.formHodActivate.addEventListener('submit', (e) => {
      e.preventDefault();
      const passkey = dom.inputHodPasskey.value;
      const officer = dom.inputHodName.value;
      submitHodActivation(passkey, officer);
    });

    // Authorized Reset Modal Listeners
    if (dom.btnHodReset) {
      dom.btnHodReset.addEventListener('click', openResetModal);
    }
    if (dom.btnCloseResetModal) {
      dom.btnCloseResetModal.addEventListener('click', closeResetModal);
    }
    if (dom.btnCancelReset) {
      dom.btnCancelReset.addEventListener('click', closeResetModal);
    }
    if (dom.btnAutofillResetKey) {
      dom.btnAutofillResetKey.addEventListener('click', () => {
        if (dom.inputResetPasskey) {
          dom.inputResetPasskey.value = 'DOOMSDAY-HOD-2026';
        }
      });
    }
    if (dom.formHodReset) {
      dom.formHodReset.addEventListener('submit', (e) => {
        e.preventDefault();
        const passkey = dom.inputResetPasskey ? dom.inputResetPasskey.value : '';
        submitHodReset(passkey);
      });
    }
    if (dom.modalHodReset) {
      dom.modalHodReset.addEventListener('click', (e) => {
        if (e.target === dom.modalHodReset) {
          closeResetModal();
        }
      });
    }
    if (dom.modalHod) {
      dom.modalHod.addEventListener('click', (e) => {
        if (e.target === dom.modalHod) {
          closeHodModal();
        }
      });
    }

    // Admin Status Drawer
    dom.btnOpenAdminDrawer.addEventListener('click', () => {
      dom.modalAdmin.style.display = 'flex';
    });
    dom.btnCloseAdminModal.addEventListener('click', () => {
      dom.modalAdmin.style.display = 'none';
    });
    dom.btnCancelAdmin.addEventListener('click', () => {
      dom.modalAdmin.style.display = 'none';
    });
    dom.formAdminStatus.addEventListener('submit', (e) => {
      e.preventDefault();
      submitAdminStatusUpdate(
        dom.adminSelectRound.value,
        dom.adminSelectStatus.value,
        dom.adminPasskey.value
      );
    });

    // Poster Lightbox
    dom.btnZoomPoster.addEventListener('click', () => {
      dom.modalPosterLightbox.style.display = 'flex';
    });
    dom.btnCloseLightbox.addEventListener('click', () => {
      dom.modalPosterLightbox.style.display = 'none';
    });
    dom.modalPosterLightbox.addEventListener('click', (e) => {
      if (e.target === dom.modalPosterLightbox) {
        dom.modalPosterLightbox.style.display = 'none';
      }
    });

    const btnShowQr = document.getElementById('btn-show-qr-modal');
    if (btnShowQr) {
      btnShowQr.addEventListener('click', () => {
        dom.modalPosterLightbox.style.display = 'flex';
      });
    }

    // Mobile Navigation Menu Toggle
    dom.mobileMenuToggle.addEventListener('click', () => {
      dom.navMenu.classList.toggle('nav-mobile-open');
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        dom.navMenu.classList.remove('nav-mobile-open');
      });
    });
  }

  // Main Boot
  async function boot() {
    console.log('%c [CODEAPEX 3.0] MARVEL CINEMATIC INTRO INITIALIZED ', 'background: #071109; color: #5DFF63; font-weight: bold; font-size: 14px;');

    setupEventListeners();
    initAmbientCanvas();
    initPosterTilt();

    // Attempt Autoplay on Page Load
    const autoplaySuccess = await attemptAudioPlayback();

    if (autoplaySuccess) {
      // Browser permitted autoplay: start intro and soundtrack together
      startCinematicIntro();
    } else {
      // Browser blocked autoplay: show cinematic "TAP TO INITIATE" full-screen prompt
      dom.autoplayPrompt.style.display = 'flex';
    }

    // Connect to WebSocket & Backend Status
    fetchServerStatus();
    initWebSocketSync();

    // Start 1-second Timers
    updateEventCountdown();
    updateLiveClocks();
    setInterval(() => {
      updateEventCountdown();
      updateLiveClocks();
    }, 1000);

    // Fast 50ms loop for millisecond 24h timer precision
    setInterval(() => {
      if (state.hodTimer.isActive) {
        renderHodTimerUI();
      }
    }, 45);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
