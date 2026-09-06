// Verification Studio: Multi-modal claim verification (Text, YouTube, Voice, Photo)
import { SAMPLE_CLAIMS } from '../services/sampleData.js';
import { verificationEngine } from '../services/verificationEngine.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { renderVerdictCard, initVerdictCard } from './verdictCard.js';

export class VerifyStudioComponent {
  constructor(container, onVerified) {
    this.container = container;
    this.onVerified = onVerified;
    this.activeModality = 'text'; // 'text' | 'youtube' | 'voice' | 'photo'
    this.currentImage = null;
    this.currentImageBoxes = [];
    this.uploadedImageUrl = null;
    this.uploadedAudioUrl = null;
    this.audioFilename = null;
    this.audioDuration = null;
    this.voiceSubmode = 'record'; // 'record' | 'upload'
    this.isRecording = false;
    this.recordedVoiceData = null;
    this.lastResult = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="breadcrumb">
        <a href="#dashboard">MediProof</a>
        <span>/</span>
        <span class="breadcrumb-current">Verification Studio</span>
      </div>

      <div class="page-title-row">
        <div>
          <h1 class="page-title">Check Online Health Claims</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
            See a health post, viral video, WhatsApp audio, or product online? Check whether it is real or fake in seconds.
          </p>
        </div>
        <div class="page-actions-group">
          <div class="workflow-status-pill" id="studio-status-pill">
            <span class="pulse-dot"></span>
            <span id="studio-status-text">Ready to Check</span>
          </div>
        </div>
      </div>

      <!-- n8n Webhook Connection Bar -->
      <div class="card card-sm" style="margin-bottom: 20px; background: #ffffff; padding: 14px 18px; border-left: 4px solid var(--accent-primary); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="color: var(--accent-primary);"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              n8n Mode:
            </span>
            <div style="display: inline-flex; background: #eef0f4; border-radius: 6px; padding: 2px;">
              <button id="btn-mode-test" type="button" style="padding: 4px 12px; font-size: 0.76rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; background: ${verificationEngine.isTestMode() ? 'var(--accent-primary)' : 'transparent'}; color: ${verificationEngine.isTestMode() ? '#ffffff' : 'var(--text-secondary)'};">
                🧪 Test URL (/webhook-test/)
              </button>
              <button id="btn-mode-prod" type="button" style="padding: 4px 12px; font-size: 0.76rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; background: ${!verificationEngine.isTestMode() ? 'var(--accent-primary)' : 'transparent'}; color: ${!verificationEngine.isTestMode() ? '#ffffff' : 'var(--text-secondary)'};">
                ⚡ Production URL (/webhook/)
              </button>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="filter-btn" id="btn-test-studio-conn" type="button" style="padding: 5px 12px; font-size: 0.76rem; display: flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
              Test Connection
            </button>
            <button class="filter-btn" id="btn-save-studio-url" type="button" style="padding: 5px 12px; font-size: 0.76rem;">
              Save Webhook
            </button>
            <span id="studio-url-saved-pill" style="font-size: 0.75rem; color: var(--sdg3-green); font-weight: 600; display: none;">✓ Saved</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <input 
            type="text" 
            id="studio-n8n-url-input" 
            style="flex: 1; padding: 7px 12px; font-size: 0.82rem; font-family: monospace; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: #fdfdfd;" 
            value="${verificationEngine.n8nWebhookUrl}" 
            placeholder="https://your-ngrok-domain.ngrok-free.dev/webhook/..." 
          />
        </div>
        <div id="studio-conn-status-msg" style="margin-top: 8px; font-size: 0.78rem; display: none; padding: 6px 12px; border-radius: 4px;"></div>
      </div>

      <!-- Modality Tabs -->
      <div class="modality-tabs-container">
        <button class="modality-tab ${this.activeModality === 'text' ? 'active' : ''}" data-modality="text">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          1. Text & Social Posts
        </button>
        <button class="modality-tab ${this.activeModality === 'youtube' ? 'active' : ''}" data-modality="youtube">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          2. YouTube & Video Link
        </button>
        <button class="modality-tab ${this.activeModality === 'voice' ? 'active' : ''}" data-modality="voice">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          3. Voice Notes & Audio
        </button>
        <button class="modality-tab ${this.activeModality === 'photo' ? 'active' : ''}" data-modality="photo">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          4. Product Photos & Labels
        </button>
      </div>

      <!-- Main Input Studio Card -->
      <div class="verify-studio-card">
        <div id="modality-form-container">
          <!-- Rendered dynamically based on activeModality -->
        </div>

        <div class="studio-buttons-footer">
          <button class="btn-secondary" id="btn-insert-sample">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Try an Example Claim
          </button>
          <button class="btn-primary" id="btn-run-verify">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Is This Real or Fake?
          </button>
        </div>
      </div>

      <!-- Verdict Result Anchor -->
      <div id="verdict-output-container"></div>
    `;

    this.attachEvents();
    this.renderActiveModalityForm();
    this.updateStatusPill();
  }

  attachEvents() {
    // Modality Tab clicks
    const tabs = this.container.querySelectorAll('.modality-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeModality = tab.getAttribute('data-modality');
        this.renderActiveModalityForm();
      });
    });

    // Mode toggles & Test Connection
    const modeTestBtn = this.container.querySelector('#btn-mode-test');
    const modeProdBtn = this.container.querySelector('#btn-mode-prod');
    const statusMsg = this.container.querySelector('#studio-conn-status-msg');

    const updateModeStyles = () => {
      const isTest = verificationEngine.isTestMode();
      if (modeTestBtn && modeProdBtn) {
        modeTestBtn.style.background = isTest ? 'var(--accent-primary)' : 'transparent';
        modeTestBtn.style.color = isTest ? '#ffffff' : 'var(--text-secondary)';
        modeProdBtn.style.background = !isTest ? 'var(--accent-primary)' : 'transparent';
        modeProdBtn.style.color = !isTest ? '#ffffff' : 'var(--text-secondary)';
      }
      if (urlInput) {
        urlInput.value = verificationEngine.n8nWebhookUrl;
      }
      this.updateStatusPill();
    };

    if (modeTestBtn) {
      modeTestBtn.addEventListener('click', () => {
        verificationEngine.setWebhookMode('test');
        updateModeStyles();
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.background = '#eff6ff';
          statusMsg.style.color = '#1e40af';
          statusMsg.style.border = '1px solid #bfdbfe';
          statusMsg.innerHTML = '🧪 Switched to <strong>Test URL</strong>. In n8n, click the orange <strong>"Listen for test event"</strong> button on your canvas before verifying.';
        }
      });
    }

    if (modeProdBtn) {
      modeProdBtn.addEventListener('click', () => {
        verificationEngine.setWebhookMode('production');
        updateModeStyles();
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.background = '#f0fdf4';
          statusMsg.style.color = '#166534';
          statusMsg.style.border = '1px solid #bbf7d0';
          statusMsg.innerHTML = '⚡ Switched to <strong>Production URL</strong>. Make sure your workflow toggle in the top-right of n8n is set to <strong>Active</strong>.';
        }
      });
    }

    // Test Connection Button
    const testConnBtn = this.container.querySelector('#btn-test-studio-conn');
    if (testConnBtn) {
      testConnBtn.addEventListener('click', async () => {
        const urlToTest = urlInput ? urlInput.value.trim() : verificationEngine.n8nWebhookUrl;
        if (!urlToTest) {
          alert('Please enter an n8n Webhook URL to test');
          return;
        }

        testConnBtn.disabled = true;
        testConnBtn.innerHTML = `Testing...`;
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.background = '#f8fafc';
          statusMsg.style.color = '#334155';
          statusMsg.style.border = '1px solid #e2e8f0';
          statusMsg.innerHTML = 'Connecting to n8n webhook via proxy...';
        }

        const res = await verificationEngine.testConnection(urlToTest);
        testConnBtn.disabled = false;
        testConnBtn.innerHTML = `
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
          Test Connection
        `;

        if (statusMsg) {
          if (res.ok) {
            statusMsg.style.background = '#f0fdf4';
            statusMsg.style.color = '#15803d';
            statusMsg.style.border = '1px solid #bbf7d0';
            statusMsg.innerHTML = `✓ <strong>Connected & Active!</strong> n8n Webhook responded successfully (HTTP ${res.status}).`;
          } else if (res.isTestUrl && res.status === 404) {
            statusMsg.style.background = '#eff6ff';
            statusMsg.style.color = '#1e40af';
            statusMsg.style.border = '1px solid #bfdbfe';
            statusMsg.innerHTML = `ℹ️ <strong>n8n is waiting for test event.</strong> In your n8n canvas, click the orange <strong>"Listen for test event"</strong> button, then click verify.`;
          } else if (res.isProductionUrl && res.status === 404) {
            statusMsg.style.background = '#fffbeb';
            statusMsg.style.color = '#b45309';
            statusMsg.style.border = '1px solid #fde68a';
            statusMsg.innerHTML = `⚠️ <strong>Workflow is Inactive in n8n.</strong> Toggle the switch in top-right of your n8n editor to <strong>Active</strong>, or switch to [Test URL] above.`;
          } else {
            statusMsg.style.background = '#fef2f2';
            statusMsg.style.color = '#b91c1c';
            statusMsg.style.border = '1px solid #fecaca';
            statusMsg.innerHTML = `✕ <strong>${res.message}</strong> ${res.hint ? `<br />👉 ${res.hint}` : ''}`;
          }
        }
      });
    }

    // Save Webhook URL Button
    const saveUrlBtn = this.container.querySelector('#btn-save-studio-url');
    const urlInput = this.container.querySelector('#studio-n8n-url-input');
    const savedPill = this.container.querySelector('#studio-url-saved-pill');

    if (saveUrlBtn && urlInput) {
      saveUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        verificationEngine.setWebhookUrl(url);
        updateModeStyles();
        if (savedPill) {
          savedPill.style.display = 'inline';
          setTimeout(() => { savedPill.style.display = 'none'; }, 2500);
        }
        this.updateStatusPill();
      });
    }

    // Run Verify Button
    const verifyBtn = this.container.querySelector('#btn-run-verify');
    verifyBtn.addEventListener('click', () => this.handleVerify());

    // Insert Sample Button
    const sampleBtn = this.container.querySelector('#btn-insert-sample');
    sampleBtn.addEventListener('click', () => this.loadRandomSample());

    // Explicitly sync mode button styles & input on initialization
    updateModeStyles();
  }

  updateStatusPill() {
    const status = verificationEngine.getEngineStatus();
    const pill = this.container.querySelector('#studio-status-pill');
    const text = this.container.querySelector('#studio-status-text');
    if (text) text.textContent = status.label;
  }

  renderActiveModalityForm() {
    const formContainer = this.container.querySelector('#modality-form-container');
    if (!formContainer) return;

    if (this.activeModality === 'text') {
      formContainer.innerHTML = `
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label">Medical Statement, WhatsApp Forward, or Health Claim</label>
            <span class="form-hint" id="char-count">0 / 2,000 characters</span>
          </div>
          <textarea 
            id="input-text-claim" 
            class="claim-textarea" 
            placeholder="Paste any health claim, article excerpt, viral tweet, or treatment advice to verify (e.g., 'Drinking raw silver water cures respiratory infection')..."
          ></textarea>
        </div>

        <div class="samples-bar">
          <span class="samples-label">💡 Try Sample Claims:</span>
          ${SAMPLE_CLAIMS.text.map(item => `
            <button class="sample-chip" data-id="${item.id}" data-modality="text">
              ${item.title}
            </button>
          `).join('')}
        </div>
      `;

      const textarea = formContainer.querySelector('#input-text-claim');
      const counter = formContainer.querySelector('#char-count');
      textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} / 2,000 characters`;
      });

    } else if (this.activeModality === 'youtube') {
      formContainer.innerHTML = `
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label">YouTube Health Video URL</label>
            <span class="form-hint">Evaluates video metadata, audio claims & clinical accuracy</span>
          </div>
          <div class="youtube-input-group">
            <input 
              type="text" 
              id="input-youtube-url" 
              class="youtube-input" 
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button class="btn-secondary" id="btn-fetch-yt" style="flex: 0 0 auto; width: auto;">
              Preview Link
            </button>
          </div>
        </div>

        <div id="yt-preview-container"></div>

        <div class="samples-bar">
          <span class="samples-label">💡 Try Sample Videos:</span>
          ${SAMPLE_CLAIMS.youtube.map(item => `
            <button class="sample-chip" data-id="${item.id}" data-modality="youtube">
              ${item.title}
            </button>
          `).join('')}
        </div>
      `;

      const fetchBtn = formContainer.querySelector('#btn-fetch-yt');
      const urlInput = formContainer.querySelector('#input-youtube-url');
      fetchBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) this.renderYouTubePreview(url);
      });

    } else if (this.activeModality === 'voice') {
      formContainer.innerHTML = `
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label">Voice Note / Audio Message Fact-Checking</label>
            <span class="form-hint">Audio file link is sent directly to n8n for Whisper transcription & verification</span>
          </div>

          <!-- Submode Switcher: Record vs Upload -->
          <div class="voice-submode-tabs">
            <button type="button" class="voice-submode-tab ${this.voiceSubmode === 'record' ? 'active' : ''}" id="tab-voice-record">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              Record with Microphone
            </button>
            <button type="button" class="voice-submode-tab ${this.voiceSubmode === 'upload' ? 'active' : ''}" id="tab-voice-upload">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Upload Audio File (MP3, WAV, M4A, OGG)
            </button>
          </div>

          <!-- Mode A: Live Mic Recorder -->
          <div id="voice-record-box-container" style="display: ${this.voiceSubmode === 'record' ? 'block' : 'none'};">
            <div class="voice-recorder-box">
              <canvas id="recorder-waveform" class="waveform-canvas" width="600" height="70"></canvas>
              
              <div class="recorder-controls">
                <button class="record-btn" id="btn-record-toggle" type="button" title="Start / Stop Recording">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
                <div class="audio-duration-display" id="voice-duration">00:00</div>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);" id="voice-status-note">
                Click microphone to start recording your voice note.
              </div>
            </div>
          </div>

          <!-- Mode B: File Upload Room -->
          <div id="voice-upload-box-container" style="display: ${this.voiceSubmode === 'upload' ? 'block' : 'none'};">
            <div class="audio-dropzone" id="audio-dropzone">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" style="color: var(--accent-primary); margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Click to upload or drag & drop audio recording</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Supports MP3, WAV, M4A, OGG, AAC, WebM, FLAC (up to 50MB)</div>
              <input type="file" id="file-audio-input" accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm,.flac" style="display: none;" />
            </div>
          </div>

          <!-- Audio Preview & Player Area -->
          <div id="voice-preview-container"></div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <div class="form-label-row">
            <label class="form-label">Additional Context or Claim Notes (Optional)</label>
            <span class="form-hint">Audio link will be transcribed & fact-checked in n8n</span>
          </div>
          <input type="text" id="input-voice-notes" class="youtube-input" placeholder="e.g., 'WhatsApp audio forward claiming salt water gargling prevents infection' (optional)..." />
        </div>

        <div class="samples-bar">
          <span class="samples-label">💡 Try Sample Audio Forwards:</span>
          ${SAMPLE_CLAIMS.voice.map(item => `
            <button class="sample-chip" data-id="${item.id}" data-modality="voice">
              ${item.title}
            </button>
          `).join('')}
        </div>
      `;

      this.initVoiceSection(formContainer);

    } else if (this.activeModality === 'photo') {
      formContainer.innerHTML = `
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label">Product Label, Supplement Packaging, or Infographic</label>
            <span class="form-hint">Multi-modal Vision (Google Gemini 2.5 Flash) checks claims & MOH/FDA numbers</span>
          </div>

          <div class="image-dropzone" id="img-dropzone">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="color: var(--accent-primary); margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Click to upload or drag & drop health product image</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Supports PNG, JPG, WebP (up to 10MB)</div>
            <input type="file" id="file-photo-input" accept="image/*" style="display: none;" />
          </div>

          <div id="photo-preview-container"></div>
        </div>

        <div class="samples-bar">
          <span class="samples-label">💡 Try Sample Images:</span>
          ${SAMPLE_CLAIMS.photo.map(item => `
            <button class="sample-chip" data-id="${item.id}" data-modality="photo">
              ${item.title}
            </button>
          `).join('')}
        </div>
      `;

      this.initPhotoUpload(formContainer);
    }

    // Attach sample click chips
    const chips = formContainer.querySelectorAll('.sample-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.getAttribute('data-id');
        const mod = chip.getAttribute('data-modality');
        this.loadSampleById(mod, id);
      });
    });
  }

  initVoiceSection(container) {
    const tabRecord = container.querySelector('#tab-voice-record');
    const tabUpload = container.querySelector('#tab-voice-upload');
    const boxRecord = container.querySelector('#voice-record-box-container');
    const boxUpload = container.querySelector('#voice-upload-box-container');

    const canvas = container.querySelector('#recorder-waveform');
    const recordBtn = container.querySelector('#btn-record-toggle');
    const durationDisplay = container.querySelector('#voice-duration');
    const statusNote = container.querySelector('#voice-status-note');

    const audioDropzone = container.querySelector('#audio-dropzone');
    const audioFileInput = container.querySelector('#file-audio-input');

    // Tab switching
    if (tabRecord && tabUpload) {
      tabRecord.addEventListener('click', () => {
        this.voiceSubmode = 'record';
        tabRecord.classList.add('active');
        tabUpload.classList.remove('active');
        if (boxRecord) boxRecord.style.display = 'block';
        if (boxUpload) boxUpload.style.display = 'none';
      });

      tabUpload.addEventListener('click', () => {
        this.voiceSubmode = 'upload';
        tabUpload.classList.add('active');
        tabRecord.classList.remove('active');
        if (boxRecord) boxRecord.style.display = 'none';
        if (boxUpload) boxUpload.style.display = 'block';
      });
    }

    // Initialize waveform in idle state
    if (canvas) audioRecorder.drawIdleWaveform(canvas);

    // Live Recording Handlers
    if (recordBtn) {
      recordBtn.addEventListener('click', async () => {
        if (!this.isRecording) {
          this.isRecording = true;
          recordBtn.classList.add('recording');
          statusNote.textContent = 'Listening... Speak clearly into your microphone.';
          
          await audioRecorder.startRecording(canvas, (formatted) => {
            durationDisplay.textContent = formatted;
          });
        } else {
          this.isRecording = false;
          recordBtn.classList.remove('recording');
          statusNote.textContent = 'Uploading voice note to generate link for n8n...';

          const result = await audioRecorder.stopRecording();
          this.recordedVoiceData = result;

          const durationSec = result.duration || 5;
          const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
          const secs = String(durationSec % 60).padStart(2, '0');
          const durationFormatted = `${mins}:${secs}`;

          // Upload audio to get public CDN / Docker URL
          const fullAudioUrl = await this.uploadAudioPayload(result.blob, `voice_recording_${Date.now()}.${result.mimeType?.includes('wav') ? 'wav' : result.mimeType?.includes('ogg') ? 'ogg' : 'webm'}`, durationSec);

          statusNote.textContent = 'Recording uploaded! Audio link ready for n8n verification.';
          if (fullAudioUrl) {
            this.renderAudioPreview(fullAudioUrl, 'Microphone Voice Recording', durationFormatted);
          }
        }
      });
    }

    // Audio File Upload Handlers
    if (audioDropzone && audioFileInput) {
      audioDropzone.addEventListener('click', () => audioFileInput.click());

      audioDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        audioDropzone.classList.add('dragover');
      });

      audioDropzone.addEventListener('dragleave', () => audioDropzone.classList.remove('dragover'));

      audioDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        audioDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleAudioFile(e.dataTransfer.files[0]);
        }
      });

      audioFileInput.addEventListener('change', () => {
        if (audioFileInput.files && audioFileInput.files[0]) {
          this.handleAudioFile(audioFileInput.files[0]);
        }
      });
    }

    // Re-render audio preview if an audio is already loaded
    if (this.uploadedAudioUrl) {
      this.renderAudioPreview(this.uploadedAudioUrl, this.audioFilename || 'Loaded Voice Note', this.audioDuration || 'Ready');
    }
  }

  async uploadAudioPayload(audioData, filename, duration) {
    try {
      let base64Data = audioData;
      let mimeType = 'audio/wav';

      if (audioData instanceof Blob) {
        mimeType = audioData.type || 'audio/wav';
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(audioData);
        });
      }

      const res = await fetch('/api/upload-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Data, filename, duration, mimeType })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.audioUrl) {
          this.uploadedAudioUrl = data.audioUrl;
          this.audioFilename = data.filename || filename;
          this.audioDuration = duration || data.duration || '00:15';
          console.log('[MediProof] Audio uploaded. URL for n8n:', data.audioUrl);
          return data.audioUrl;
        }
      }
    } catch (e) {
      console.warn('[MediProof] Audio upload error:', e);
    }
    return null;
  }

  handleAudioFile(file) {
    const reader = new FileReader();
    const container = this.container.querySelector('#voice-preview-container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); text-align: center; font-size: 0.85rem; color: #475569;">
          ⏳ Uploading audio file <strong>${file.name}</strong> to generate link for n8n...
        </div>
      `;
    }

    reader.onload = async (e) => {
      const base64Data = e.target.result;
      const uploadedUrl = await this.uploadAudioPayload(base64Data, file.name);
      if (uploadedUrl) {
        this.renderAudioPreview(uploadedUrl, file.name, 'Uploaded File');
      }
    };
    reader.readAsDataURL(file);
  }

  renderAudioPreview(audioUrl, title, durationStr = 'Ready') {
    const container = this.container.querySelector('#voice-preview-container');
    if (!container) return;

    container.innerHTML = `
      <div class="audio-preview-card">
        <div class="audio-preview-header">
          <div class="audio-preview-info">
            <div class="audio-preview-icon">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div>
              <div class="audio-preview-name">${title || 'Voice Note Recording'}</div>
              <div class="audio-preview-meta">${durationStr} • Ready for Fact-Checking</div>
            </div>
          </div>
          <button type="button" class="btn-secondary" id="btn-clear-voice" style="padding: 4px 10px; font-size: 0.74rem;">
            Change Audio
          </button>
        </div>

        <div class="audio-player-wrapper">
          <audio controls src="${audioUrl}" style="width: 100%;"></audio>
        </div>

        <div class="audio-url-badge">
          <div class="audio-url-badge-label">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            Audio Link (Passed to n8n as <code>audio_url</code> & <code>voice_url</code>):
          </div>
          <a href="${audioUrl}" target="_blank" class="audio-url-badge-link">${audioUrl}</a>
        </div>
      </div>
    `;

    const clearBtn = container.querySelector('#btn-clear-voice');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.uploadedAudioUrl = null;
        this.audioFilename = null;
        this.audioDuration = null;
        container.innerHTML = '';
      });
    }
  }

  initPhotoUpload(container) {
    const dropzone = container.querySelector('#img-dropzone');
    const fileInput = container.querySelector('#file-photo-input');

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        this.handleImageFile(fileInput.files[0]);
      }
    });
  }

  async uploadImagePayload(base64Data, filename) {
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, filename })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.imageUrl) {
          this.uploadedImageUrl = data.imageUrl;
          console.log('[MediProof] Image uploaded. Public URL:', data.imageUrl);
          return data.imageUrl;
        }
      }
    } catch (e) {
      console.warn('[MediProof] Upload error:', e);
    }
    return base64Data;
  }

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      this.currentImage = e.target.result;
      this.currentImageBoxes = [
        { top: '35%', left: '20%', width: '60%', height: '16%', label: 'Claim: Active Ingredients' },
        { top: '60%', left: '15%', width: '70%', height: '18%', label: 'Regulatory Registration Check' }
      ];
      this.renderImagePreview(this.currentImage, file.name, 'Uploading to Image CDN...', this.currentImageBoxes);

      // Upload and generate full public URL for n8n
      const fullUrl = await this.uploadImagePayload(this.currentImage, file.name);
      this.uploadedImageUrl = fullUrl;
      this.renderImagePreview(this.currentImage, file.name, 'Product Image Loaded', this.currentImageBoxes, fullUrl);
    };
    reader.readAsDataURL(file);
  }

  renderImagePreview(imgSrc, title, tag, boxes = [], fullUrl = null) {
    const container = this.container.querySelector('#photo-preview-container');
    if (!container) return;

    const boxesHtml = boxes.map(box => `
      <div class="bounding-box-overlay" style="top: ${box.top}; left: ${box.left}; width: ${box.width}; height: ${box.height};">
        <span class="bounding-box-label">${box.label}</span>
      </div>
    `).join('');

    const urlDisplayHtml = fullUrl ? `
      <div style="margin-top: 10px; padding: 8px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 0.76rem; color: #166534;">
        <div style="font-weight: 700; margin-bottom: 2px;">✓ Full Image URL (Sent to n8n as <code>image_url</code>):</div>
        <div style="word-break: break-all; font-family: monospace; font-size: 0.72rem; color: #15803d;">${fullUrl}</div>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="image-preview-stage">
        <div class="image-preview-wrapper">
          <img src="${imgSrc}" alt="Inspection Preview" />
          ${boxesHtml}
        </div>
        <div style="flex: 1; min-width: 250px;">
          <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px;">${title}</div>
          <div class="status-indicator-pill status-in-progress" style="margin-bottom: 8px;">${tag}</div>
          <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>Detected Regions of Interest:</strong><br />
            - OCR Scan on Pharmaceutical / MOH registration code<br />
            - Ingredient composition & toxicity screening<br />
            - Verified against FDA / MOH NPRA database
          </div>
          ${urlDisplayHtml}
        </div>
      </div>
    `;
  }

  renderYouTubePreview(url) {
    const previewContainer = this.container.querySelector('#yt-preview-container');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
      <div class="video-preview-box">
        <img class="video-thumb" src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80" alt="Thumbnail" />
        <div>
          <div class="video-info-title">YouTube Health Video Detected</div>
          <div class="video-info-channel">${url}</div>
          <div style="font-size: 0.78rem; color: var(--sdg3-green); margin-top: 6px; font-weight: 600;">
            ✓ Transcript & Audio Extraction Available for Gemini 2.5 Flash
          </div>
        </div>
      </div>
    `;
  }

  loadSampleById(modality, id) {
    if (modality === 'text') {
      const sample = SAMPLE_CLAIMS.text.find(s => s.id === id);
      if (sample) {
        const textarea = this.container.querySelector('#input-text-claim');
        if (textarea) {
          textarea.value = sample.claim;
          textarea.dispatchEvent(new Event('input'));
        }
      }
    } else if (modality === 'youtube') {
      const sample = SAMPLE_CLAIMS.youtube.find(s => s.id === id);
      if (sample) {
        const input = this.container.querySelector('#input-youtube-url');
        if (input) input.value = sample.url;
        const previewContainer = this.container.querySelector('#yt-preview-container');
        if (previewContainer) {
          previewContainer.innerHTML = `
            <div class="video-preview-box">
              <img class="video-thumb" src="${sample.thumbnail}" alt="Thumbnail" />
              <div>
                <div class="video-info-title">${sample.title}</div>
                <div class="video-info-channel">${sample.channel} • ${sample.duration}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px;">
                  <strong>Extracted Claim:</strong> "${sample.extractedClaim}"
                </div>
              </div>
            </div>
          `;
        }
      }
    } else if (modality === 'voice') {
      const sample = SAMPLE_CLAIMS.voice.find(s => s.id === id);
      if (sample) {
        this.uploadedAudioUrl = sample.audioUrl || sample.localAudioUrl;
        this.audioFilename = sample.filename || `${sample.id}.wav`;
        this.audioDuration = sample.duration || '00:20';
        const inputNotes = this.container.querySelector('#input-voice-notes');
        if (inputNotes) inputNotes.value = sample.title;
        this.renderAudioPreview(this.uploadedAudioUrl, sample.title, sample.duration);
      }
    } else if (modality === 'photo') {
      const sample = SAMPLE_CLAIMS.photo.find(s => s.id === id);
      if (sample) {
        this.currentImage = sample.image;
        this.uploadedImageUrl = sample.image;
        this.currentImageBoxes = sample.boundingBoxes || [];
        this.renderImagePreview(sample.image, sample.title, sample.tag, sample.boundingBoxes, sample.image);
      }
    }
  }

  loadRandomSample() {
    const list = SAMPLE_CLAIMS[this.activeModality];
    if (list && list.length > 0) {
      const rand = list[Math.floor(Math.random() * list.length)];
      this.loadSampleById(this.activeModality, rand.id);
    }
  }

  async handleVerify() {
    const verifyBtn = this.container.querySelector('#btn-run-verify');
    const outputContainer = this.container.querySelector('#verdict-output-container');

    let inputData = {};

    if (this.activeModality === 'text') {
      const text = this.container.querySelector('#input-text-claim')?.value.trim();
      if (!text) {
        alert('Please enter or select a health claim to verify.');
        return;
      }
      inputData = { text };
    } else if (this.activeModality === 'youtube') {
      const url = this.container.querySelector('#input-youtube-url')?.value.trim();
      if (!url) {
        alert('Please enter a YouTube video URL.');
        return;
      }
      inputData = { url, text: url };
    } else if (this.activeModality === 'voice') {
      if (!this.uploadedAudioUrl) {
        alert('Please record a voice note or upload an audio file to verify.');
        return;
      }
      const notes = this.container.querySelector('#input-voice-notes')?.value.trim();
      inputData = {
        audioUrl: this.uploadedAudioUrl,
        audio_url: this.uploadedAudioUrl,
        voice_url: this.uploadedAudioUrl,
        url: this.uploadedAudioUrl,
        duration: this.audioDuration || 15,
        filename: this.audioFilename || 'voice_recording.wav',
        notes: notes || 'Voice note audio verification',
        text: notes || 'Voice note audio verification'
      };
    } else if (this.activeModality === 'photo') {
      if (!this.currentImage) {
        // Fallback to sample photo
        this.loadSampleById('photo', 'ph-1');
      }

      let finalImageUrl = this.uploadedImageUrl || this.currentImage;
      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        verifyBtn.innerHTML = `Uploading Image to CDN...`;
        finalImageUrl = await this.uploadImagePayload(finalImageUrl, 'photo_scan.png');
      }

      inputData = {
        title: 'Health Product Label',
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        image_url: finalImageUrl,
        caption: 'MOH/FDA label analysis'
      };
    }

    // Set loading state
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = `
      <svg class="spin-animate" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      Checking if Real or Fake...
    `;

    outputContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-light); margin-top: 24px;">
        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">Fact-Checking Online Claim...</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">Comparing against official guidelines from the World Health Organization (WHO) and Ministry of Health (MOH)</div>
      </div>
    `;

    try {
      // Sync current input value directly to engine before firing
      const liveUrlInput = this.container.querySelector('#studio-n8n-url-input');
      if (liveUrlInput && liveUrlInput.value.trim()) {
        verificationEngine.setWebhookUrl(liveUrlInput.value.trim());
      }

      const result = await verificationEngine.verifyClaim(this.activeModality, inputData);
      this.lastResult = result;

      // Render Verdict Card & initialize translation + action handlers
      outputContainer.innerHTML = renderVerdictCard(result);
      initVerdictCard(outputContainer, result);

      // Scroll smoothly to verdict
      outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Notify parent/dashboard
      if (this.onVerified) {
        this.onVerified(result);
      }
    } catch (err) {
      console.error(err);
      const isTest = verificationEngine.isTestMode();
      const isProd404 = !isTest && (err.status === 404 || (err.hint && err.hint.includes('active')) || (err.message && err.message.includes('not registered')));
      const isTest404 = isTest && (err.status === 404 || (err.hint && err.hint.includes('Execute workflow')) || (err.hint && err.hint.includes('test mode')));

      outputContainer.innerHTML = `
        <div class="card" style="margin-top: 24px; padding: 24px; border: 1.5px solid #fca5a5; background: #fffaf0; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
          <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 700; color: #991b1b; margin-bottom: 4px;">
                Could Not Reach n8n Webhook
              </div>
              <div style="font-size: 0.85rem; color: #7f1d1d; font-family: monospace;">
                ${err.message.split('\n')[0]}
              </div>
            </div>
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-md); padding: 14px 18px; border: 1px solid #fed7aa; margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: 0.88rem; color: #9a3412; margin-bottom: 8px;">
              💡 How to Fix This in n8n:
            </div>
            ${isTest404 ? `
              <div style="font-size: 0.84rem; color: #431407; line-height: 1.6;">
                You are currently in <strong>Test URL Mode</strong> (<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">/webhook-test/...</code>).<br />
                1. Open your <strong>n8n workflow</strong> tab in your browser.<br />
                2. In your Webhook node or on the canvas, click the orange <strong>"Listen for test event"</strong> (or "Test this trigger") button.<br />
                3. Return here and click <strong>"Retry Verification"</strong>.
              </div>
            ` : isProd404 ? `
              <div style="font-size: 0.84rem; color: #431407; line-height: 1.6;">
                You are currently in <strong>Production URL Mode</strong> (<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">/webhook/...</code>), but the workflow is <strong>Inactive</strong>.<br />
                👉 <strong>Option 1 (Canvas Testing):</strong> Click <strong>"Switch to Test URL"</strong> below, then click the orange <strong>"Listen for test event"</strong> in n8n and retry.<br />
                👉 <strong>Option 2 (Live Workflow):</strong> In your n8n editor, toggle the switch in the top-right corner to <strong>Active</strong>.
              </div>
            ` : `
              <div style="font-size: 0.84rem; color: #431407; line-height: 1.6;">
                ${err.hint || err.message}
              </div>
            `}
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${!isTest ? `
              <button class="filter-btn" id="btn-err-switch-test" type="button" style="background: var(--accent-primary); color: white; border: none; font-size: 0.8rem; padding: 8px 16px;">
                🧪 Switch to Test URL (/webhook-test/)
              </button>
            ` : `
              <button class="filter-btn" id="btn-err-switch-prod" type="button" style="background: var(--accent-primary); color: white; border: none; font-size: 0.8rem; padding: 8px 16px;">
                ⚡ Switch to Production URL (/webhook/)
              </button>
            `}
            <button class="btn-primary" id="btn-err-retry" type="button" style="width: auto; padding: 8px 20px; font-size: 0.8rem;">
              ↻ Retry Verification
            </button>
          </div>
        </div>
      `;

      // Attach diagnostic button listeners
      const switchTestBtn = outputContainer.querySelector('#btn-err-switch-test');
      if (switchTestBtn) {
        switchTestBtn.addEventListener('click', () => {
          verificationEngine.setWebhookMode('test');
          const input = this.container.querySelector('#studio-n8n-url-input');
          if (input) input.value = verificationEngine.n8nWebhookUrl;
          const testBtn = this.container.querySelector('#btn-mode-test');
          const prodBtn = this.container.querySelector('#btn-mode-prod');
          if (testBtn && prodBtn) {
            testBtn.style.background = 'var(--accent-primary)';
            testBtn.style.color = '#ffffff';
            prodBtn.style.background = 'transparent';
            prodBtn.style.color = 'var(--text-secondary)';
          }
          this.handleVerify();
        });
      }

      const switchProdBtn = outputContainer.querySelector('#btn-err-switch-prod');
      if (switchProdBtn) {
        switchProdBtn.addEventListener('click', () => {
          verificationEngine.setWebhookMode('production');
          const input = this.container.querySelector('#studio-n8n-url-input');
          if (input) input.value = verificationEngine.n8nWebhookUrl;
          const testBtn = this.container.querySelector('#btn-mode-test');
          const prodBtn = this.container.querySelector('#btn-mode-prod');
          if (testBtn && prodBtn) {
            testBtn.style.background = 'transparent';
            testBtn.style.color = 'var(--text-secondary)';
            prodBtn.style.background = 'var(--accent-primary)';
            prodBtn.style.color = '#ffffff';
          }
          this.handleVerify();
        });
      }

      const retryBtn = outputContainer.querySelector('#btn-err-retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.handleVerify());
      }
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = `
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Is This Real or Fake?
      `;
    }
  }
}
