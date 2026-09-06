// n8n Workflow Integration & Payload Inspector View
import { verificationEngine } from '../services/verificationEngine.js';

export class WorkflowViewComponent {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
  }

  render() {
    const currentMode = verificationEngine.mode;
    const webhookUrl = verificationEngine.n8nWebhookUrl;

    this.container.innerHTML = `
      <div class="breadcrumb">
        <a href="#dashboard">MediProof</a>
        <span>/</span>
        <span class="breadcrumb-current">n8n Workflow Hub</span>
      </div>

      <div class="page-title-row">
        <div>
          <h1 class="page-title">n8n Automation Architecture</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
            Workflow ID: <code>8T84Huj5dVFF9NqX</code> • Switch Router • Groq LLaMA & Google Gemini 2.5 Flash Chains
          </p>
        </div>
        <div class="page-actions-group">
          <button class="filter-btn" id="btn-ping-webhook">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Test Webhook Ping
          </button>
        </div>
      </div>

      <!-- Configuration Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">Live Webhook Configuration</div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">
          Connect your running n8n instance or switch to MediProof's autonomous client-side medical AI.
        </p>

        <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 1.2; min-width: 280px;">
            <label class="form-label" style="display: block; margin-bottom: 6px;">n8n Webhook Target URL</label>
            <input 
              type="text" 
              id="input-webhook-url" 
              class="youtube-input" 
              placeholder="https://your-n8n.ngrok-free.app/webhook/..." 
              value="${webhookUrl}"
            />
          </div>

          <div style="flex: 1.2; min-width: 280px;">
            <label class="form-label" style="display: block; margin-bottom: 6px;">Reply Callback URL (<code>callback_url</code> sent to n8n)</label>
            <input 
              type="text" 
              id="input-callback-url" 
              class="youtube-input" 
              placeholder="https://your-site.ngrok-free.app/api/n8n-callback" 
              value="${verificationEngine.getCallbackUrl()}"
            />
          </div>

          <div style="min-width: 180px;">
            <label class="form-label" style="display: block; margin-bottom: 6px;">Engine Operating Mode</label>
            <select id="select-engine-mode" style="width: 100%; padding: 11px 14px; border-radius: var(--radius-md);">
              <option value="autonomous" ${currentMode === 'autonomous' ? 'selected' : ''}>Autonomous AI (Instant)</option>
              <option value="n8n" ${currentMode === 'n8n' ? 'selected' : ''}>Live n8n Webhook Stream</option>
            </select>
          </div>

          <button class="btn-primary" id="btn-save-webhook-config" style="flex: 0 0 auto; width: auto; padding: 11px 24px;">
            Save Configuration
          </button>
        </div>
        <div id="webhook-feedback-msg" style="margin-top: 10px; font-size: 0.82rem;"></div>
      </div>

      <!-- Interactive n8n Visual Flowchart -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="section-header">
          <div class="section-title">n8n Execution Pipeline Flow</div>
          <span class="status-indicator-pill status-completed">4 Modality Routes Active</span>
        </div>

        <div class="workflow-graph">
          <!-- Step 1: Webhook -->
          <div class="flow-node">
            <div class="flow-node-title">
              <span style="color: #6366f1;">🌐</span> Webhook Trigger
            </div>
            <div>
              <span class="flow-node-badge">POST /webhook/6e567f04...</span>
              <span class="status-indicator-pill status-completed" style="margin-left: 8px;">Active</span>
            </div>
          </div>

          <div style="text-align: center; color: var(--text-muted); font-size: 1.1rem;">↓</div>

          <!-- Step 2: Switch Router -->
          <div class="flow-node" style="border-left: 4px solid var(--accent-primary);">
            <div class="flow-node-title">
              <span style="color: var(--accent-primary);">🔀</span> Switch Node Router
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              Inspects <code>$json.message</code> for: text, youtube.com, voice, photo
            </div>
          </div>

          <div style="text-align: center; color: var(--text-muted); font-size: 1.1rem;">↓</div>

          <!-- Step 3: 4 Parallel Modality Branches -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
            <div class="card card-sm" style="background: #ffffff;">
              <div style="font-weight: 700; font-size: 0.85rem; color: #1e40af; margin-bottom: 4px;">Branch 1: YouTube</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Rule: contains 'youtube.com'</div>
              <div class="stat-pill" style="font-size: 0.7rem;">Gemini 2.5 Flash</div>
            </div>

            <div class="card card-sm" style="background: #ffffff;">
              <div style="font-weight: 700; font-size: 0.85rem; color: #065f46; margin-bottom: 4px;">Branch 2: Text / Caption</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Rule: text not empty</div>
              <div class="stat-pill" style="font-size: 0.7rem;">Groq (gpt-oss-120b)</div>
            </div>

            <div class="card card-sm" style="background: #ffffff;">
              <div style="font-weight: 700; font-size: 0.85rem; color: #92400e; margin-bottom: 4px;">Branch 3: Voice Note</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Telegram File -> Groq Whisper API</div>
              <div class="stat-pill" style="font-size: 0.7rem;">Whisper + Groq LLM</div>
            </div>

            <div class="card card-sm" style="background: #ffffff;">
              <div style="font-weight: 700; font-size: 0.85rem; color: #991b1b; margin-bottom: 4px;">Branch 4: Photo / Label</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">Photo Array -> Gemini Vision</div>
              <div class="stat-pill" style="font-size: 0.7rem;">Gemini 2.5 Flash Vision</div>
            </div>
          </div>

          <div style="text-align: center; color: var(--text-muted); font-size: 1.1rem;">↓</div>

          <!-- Step 4: HTTP Response -->
          <div class="flow-node" style="border-left: 4px solid var(--sdg3-green);">
            <div class="flow-node-title">
              <span style="color: var(--sdg3-green);">📤</span> HTTP Request 1 (Verdict Aggregator)
            </div>
            <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--sdg3-green); font-weight: 600;">
              Returns: [VERDICT], [EXPLANATION], [SOURCES]
            </div>
          </div>
        </div>
      </div>

      <!-- Sample JSON Payload Inspector -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">Live Payload Inspector (n8n Webhook Format)</div>
          <div style="display: flex; gap: 6px;">
            <button class="filter-btn" id="btn-payload-text">Text Payload</button>
            <button class="filter-btn" id="btn-payload-voice">Voice Payload</button>
            <button class="filter-btn" id="btn-payload-photo">Photo Payload</button>
          </div>
        </div>

        <pre class="json-display-box" id="payload-code-display"></pre>
      </div>
    `;

    this.attachEvents();
    this.showSamplePayload('text');
  }

  attachEvents() {
    const saveBtn = this.container.querySelector('#btn-save-webhook-config');
    const urlInput = this.container.querySelector('#input-webhook-url');
    const callbackInput = this.container.querySelector('#input-callback-url');
    const modeSelect = this.container.querySelector('#select-engine-mode');
    const msg = this.container.querySelector('#webhook-feedback-msg');

    saveBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      const callbackUrl = callbackInput ? callbackInput.value.trim() : '';
      const mode = modeSelect.value;

      verificationEngine.setWebhookUrl(url);
      if (callbackUrl) verificationEngine.setCallbackUrl(callbackUrl);
      verificationEngine.setEngineMode(mode);

      msg.innerHTML = `<span style="color: var(--sdg3-green); font-weight: 600;">✓ Configuration saved! n8n will reply back to: <code>${verificationEngine.getCallbackUrl()}</code></span>`;
      if (this.onStatusChange) this.onStatusChange();
      this.showSamplePayload('text');
    });

    const pingBtn = this.container.querySelector('#btn-ping-webhook');
    pingBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url) {
        alert('Please enter your n8n webhook URL first.');
        return;
      }
      pingBtn.disabled = true;
      pingBtn.textContent = 'Pinging...';
      msg.innerHTML = '<span style="color: var(--text-muted);">Testing connection to n8n webhook...</span>';

      try {
        const testPayload = {
          mode: 'Text',
          message: 'ping test medical verification',
          callback_url: verificationEngine.getCallbackUrl()
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });
        msg.innerHTML = `<span style="color: var(--sdg3-green); font-weight: 700;">✓ Connection successful! Received HTTP ${res.status} ${res.statusText}.</span>`;
      } catch (err) {
        msg.innerHTML = `<span style="color: #e11d48; font-weight: 600;">⚠️ Could not reach webhook (${err.message}). Ensure n8n is running with CORS enabled or test via localhost proxy. Autonomous engine will handle queries in the meantime.</span>`;
      } finally {
        pingBtn.disabled = false;
        pingBtn.textContent = 'Test Webhook Ping';
      }
    });

    const btnText = this.container.querySelector('#btn-payload-text');
    const btnVoice = this.container.querySelector('#btn-payload-voice');
    const btnPhoto = this.container.querySelector('#btn-payload-photo');

    btnText.addEventListener('click', () => this.showSamplePayload('text'));
    btnVoice.addEventListener('click', () => this.showSamplePayload('voice'));
    btnPhoto.addEventListener('click', () => this.showSamplePayload('photo'));
  }

  showSamplePayload(type) {
    const display = this.container.querySelector('#payload-code-display');
    if (!display) return;

    const replyCallback = verificationEngine.getCallbackUrl();
    let payloadObj = {};

    if (type === 'text') {
      payloadObj = {
        mode: "Text",
        message: "Drinking raw colloidal silver water cures viral lung infections in 48 hours.",
        callback_url: replyCallback
      };
    } else if (type === 'voice') {
      payloadObj = {
        mode: "Voice",
        message: "WhatsApp forward: gargling salt water kills virus in throat",
        callback_url: replyCallback,
        voice: {
          file_id: "voice_audio_sample_4822",
          duration: 18
        }
      };
    } else if (type === 'photo') {
      payloadObj = {
        mode: "Photo",
        image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        message: "Is this supplement approved by MOH Malaysia? Reg No MAL19920199X",
        callback_url: replyCallback,
        photo: [
          { file_id: "supplement_bottle_photo_4823", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600" }
        ]
      };
    }

    display.textContent = JSON.stringify(payloadObj, null, 2);
  }
}
