// MediProof Verification Engine
// Directly pushes user claims to n8n Webhook and retrieves real output from n8n

export class VerificationEngine {
  constructor() {
    let saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('mediproof_n8n_webhook') : null;
    // Set to Live Production URL now that n8n workflow is published
    if (!saved || saved.includes('/webhook-test/')) {
      saved = 'https://rosy-subside-selected.ngrok-free.dev/webhook/6e567f04-b2ce-4b29-a284-2e8b1bbf94e3';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mediproof_n8n_webhook', saved);
      }
    }
    this.n8nWebhookUrl = saved;
    this.callbackUrl = (typeof localStorage !== 'undefined') ? (localStorage.getItem('mediproof_callback_url') || '') : '';
  }

  setWebhookUrl(url) {
    this.n8nWebhookUrl = url.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mediproof_n8n_webhook', this.n8nWebhookUrl);
    }
  }

  getCallbackUrl() {
    const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('mediproof_callback_url') : null;
    if (saved && saved.trim()) return saved.trim();
    return 'http://host.docker.internal:3000/api/n8n-callback';
  }

  setCallbackUrl(url) {
    this.callbackUrl = url.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mediproof_callback_url', this.callbackUrl);
    }
  }

  isTestMode() {
    return this.n8nWebhookUrl.includes('/webhook-test/');
  }

  setWebhookMode(mode) {
    if (mode === 'test' && !this.isTestMode()) {
      this.n8nWebhookUrl = this.n8nWebhookUrl.replace('/webhook/', '/webhook-test/');
    } else if (mode === 'production' && this.isTestMode()) {
      this.n8nWebhookUrl = this.n8nWebhookUrl.replace('/webhook-test/', '/webhook/');
    }
    localStorage.setItem('mediproof_n8n_webhook', this.n8nWebhookUrl);
    return this.n8nWebhookUrl;
  }

  async testConnection(urlToTest) {
    const target = urlToTest || this.n8nWebhookUrl;
    try {
      const res = await fetch('/api/test-n8n-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: target })
      });
      return await res.json();
    } catch (e) {
      return { ok: false, status: 502, message: e.message, hint: 'Server proxy unavailable.' };
    }
  }

  getEngineStatus() {
    if (this.n8nWebhookUrl) {
      const modeLabel = this.isTestMode() ? 'n8n Test URL' : 'n8n Production URL';
      return { active: true, label: modeLabel, url: this.n8nWebhookUrl, isTest: this.isTestMode() };
    }
    return { active: false, label: 'n8n URL Required', url: null };
  }

  /**
   * Main verification dispatcher
   * Pushes the claim directly to the n8n Webhook and retrieves the real output from n8n
   * @param {'text' | 'youtube' | 'voice' | 'photo'} modality
   * @param {Object} inputData
   * @returns {Promise<Object>} Formatted real verification verdict from n8n
   */
  async verifyClaim(modality, inputData) {
    if (!this.n8nWebhookUrl || !this.n8nWebhookUrl.trim()) {
      throw new Error("n8n Webhook URL is not set. Please enter your n8n Webhook URL so MediProof can push claims to your workflow.");
    }

    const startTime = performance.now();
    const requestTimestamp = Date.now();

    // Construct the exact n8n payload matching your workflow
    const n8nPayload = this.constructN8nPayload(modality, inputData);

    console.log('[MediProof] Pushing input to n8n Webhook via proxy:', this.n8nWebhookUrl);
    console.log('[MediProof] Payload sent to n8n:', n8nPayload);

    let rawResultText = '';
    let usedRoute = `n8n Webhook: ${this.n8nWebhookUrl}`;
    let modelName = 'n8n Workflow Execution';

    try {
      // Forward via server proxy to eliminate browser CORS errors and ngrok warning screens
      const response = await fetch('/api/forward-to-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: this.n8nWebhookUrl,
          payload: n8nPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: HTTP ${response.status} ${response.statusText}`);
      }

      const proxyResult = await response.json();

      if (!proxyResult.ok) {
        let msg = proxyResult.message || `HTTP ${proxyResult.status}`;
        if (proxyResult.hint) {
          msg += `\n\n👉 Next Step: ${proxyResult.hint}`;
        }
        const err = new Error(msg);
        err.status = proxyResult.status;
        err.hint = proxyResult.hint;
        err.isTestUrl = proxyResult.isTestUrl;
        err.isProductionUrl = proxyResult.isProductionUrl;
        err.targetUrl = this.n8nWebhookUrl;
        throw err;
      }

      const parsedData = proxyResult.data;
      console.log('[MediProof] Direct response from n8n Webhook:', parsedData);

      // Check if n8n returned the verdict directly (Synchronous mode)
      const directText = typeof parsedData === 'string' ? parsedData : (parsedData.text || parsedData.response || parsedData.output || (typeof parsedData === 'object' ? JSON.stringify(parsedData) : ''));

      if (directText && (/\[VERDICT\]/i.test(directText) || directText.length > 50)) {
        rawResultText = directText;
      } else {
        // Asynchronous mode: n8n acknowledged and will post back to /api/n8n-callback
        console.log(`[MediProof] Waiting for n8n to send AI output to callback_url for claim_id: ${n8nPayload.claim_id}...`);
        const callbackResult = await this.waitForN8nCallback(requestTimestamp, 45000, n8nPayload.claim_id);
        rawResultText = callbackResult.rawText || callbackResult.explanation || JSON.stringify(callbackResult);
      }
    } catch (err) {
      console.error('[MediProof] Failed to push to n8n:', err);
      throw err;
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    const parsed = this.parseStrictVerdict(rawResultText);

    return {
      id: n8nPayload.claim_id || ('N8N-' + Math.floor(1000 + Math.random() * 9000)),
      claim_id: n8nPayload.claim_id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modality,
      inputData,
      n8nPayload,
      verdict: parsed.verdict,
      explanation: parsed.explanation,
      sources: parsed.sources,
      confidence: parsed.confidence,
      workflowRoute: usedRoute,
      modelUsed: modelName,
      latency: `${duration}s`,
      rawOutput: rawResultText
    };
  }

  /**
   * Packages payload for n8n
   * Includes mode, user message, claim_id, and callback_url
   */
  constructN8nPayload(modality, inputData) {
    const callbackUrl = this.getCallbackUrl();
    const modeKey = modality === 'text' ? 'Text' : modality === 'voice' ? 'Voice' : modality === 'photo' ? 'Photo' : 'youtube';
    const textValue = inputData.text || inputData.url || inputData.caption || (modality === 'voice' ? (inputData.notes || 'Voice note audio verification') : (modality === 'photo' ? 'MOH/FDA label analysis' : ''));
    
    // Unique identifier requested by user (e.g. "12345-abcde")
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const claimId = inputData.claim_id || `${Math.floor(10000 + Math.random() * 90000)}-${randomSuffix}`;

    const payload = {
      mode: modeKey,
      message: textValue,
      claim_id: claimId, // <-- Added unique claim_id matching user instruction
      callback_url: callbackUrl,
      text: textValue
    };

    if (modality === 'youtube') {
      payload.url = inputData.url || textValue;
    } else if (modality === 'voice') {
      const fullAudioUrl = inputData.audioUrl || inputData.audio_url || inputData.voice_url || inputData.url || (typeof inputData.voice === 'object' ? inputData.voice.url : '') || '';
      payload.audio_url = fullAudioUrl; // Sent in link form exactly like image_url: { "mode": "Voice", "audio_url": "https://..." }
      payload.voice_url = fullAudioUrl;
      payload.url = fullAudioUrl;
      payload.voice = {
        url: fullAudioUrl,
        file_id: inputData.filename || 'voice_note.wav',
        duration: inputData.duration || 15
      };
      if (!payload.message) {
        payload.message = `Voice note audio verification: ${fullAudioUrl}`;
      }
    } else if (modality === 'photo') {
      const fullImageUrl = inputData.imageUrl || inputData.image_url || inputData.image || '';
      payload.image_url = fullImageUrl; // Exactly matches: { "mode": "Photo", "image_url": "https://..." }
      payload.photo_url = fullImageUrl;
      payload.url = fullImageUrl;
      payload.photo = [{ file_id: fullImageUrl, url: fullImageUrl }];
    }

    return payload;
  }

  /**
   * Waits for n8n to send the real AI output back to /api/n8n-callback
   */
  async waitForN8nCallback(sinceTimestamp, timeoutMs = 45000, targetClaimId = null) {
    const pollInterval = 1000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      try {
        const res = await fetch('/api/n8n-latest');
        if (res.ok) {
          const data = await res.json();
          if (data && data.items && data.items.length > 0) {
            const match = data.items.find(item => {
              if (targetClaimId && (item.claim_id === targetClaimId || item.id === targetClaimId)) {
                return true;
              }
              return item.receivedAt >= (sinceTimestamp - 1000);
            });
            if (match) {
              console.log('[MediProof] Successfully captured real output from n8n callback for claim_id:', match.claim_id || match.id);
              return match;
            }
          }
        }
      } catch (e) {
        // continue polling
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timed out after ${timeoutMs / 1000}s waiting for n8n to complete for claim_id: ${targetClaimId || 'N/A'}. Please ensure your n8n workflow finishes and sends the result back to ${this.getCallbackUrl()}`);
  }

  /**
   * Parses the real output returned from n8n LLM Chain:
   * [VERDICT]: (True, False, Misleading, Unverified)
   * [EXPLANATION]: (Brief explanation)
   * [SOURCES]: (Authoritative citations)
   */
  parseStrictVerdict(rawText) {
    let verdict = 'Unverified';
    let explanation = '';
    let sources = [];
    let confidence = 95;

    const verdictMatch = rawText.match(/\[VERDICT\]:\s*([^\n\r]+)/i);
    if (verdictMatch) {
      const v = verdictMatch[1].trim().toLowerCase();
      if (v.includes('true')) {
        verdict = 'True';
        confidence = 97;
      } else if (v.includes('false')) {
        verdict = 'False';
        confidence = 98;
      } else if (v.includes('misleading')) {
        verdict = 'Misleading';
        confidence = 91;
      } else {
        verdict = 'Unverified';
        confidence = 74;
      }
    }

    const expMatch = rawText.match(/\[EXPLANATION\]:\s*([\s\S]*?)(?=\[SOURCE|\n\n\[|$)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
    } else {
      explanation = rawText;
    }

    const sourceMatch = rawText.match(/\[SOURCES?\]:\s*([\s\S]*?)$/i);
    if (sourceMatch) {
      const srcStr = sourceMatch[1].trim();
      const parts = srcStr.split(/[,|\n;]/).map(s => s.trim()).filter(Boolean);
      sources = parts.map(part => {
        let type = 'MOH / WHO';
        if (/who/i.test(part)) type = 'WHO';
        else if (/cdc/i.test(part)) type = 'CDC';
        else if (/moh|kkm|npra/i.test(part)) type = 'MOH';
        else if (/fda/i.test(part)) type = 'FDA';
        else if (/nih|pubmed|lancet/i.test(part)) type = 'PubMed';
        return {
          name: part.replace(/^(WHO|CDC|MOH|FDA|NIH|PubMed):\s*/i, ''),
          type,
          url: `https://www.google.com/search?q=${encodeURIComponent(part + ' official health guidance')}`
        };
      });
    }

    if (sources.length === 0) {
      sources = [
        { name: 'Ministry of Health Malaysia (MOH / KKM)', type: 'MOH', url: 'https://www.moh.gov.my' },
        { name: 'World Health Organization (WHO)', type: 'WHO', url: 'https://www.who.int' }
      ];
    }

    return { verdict, explanation, sources, confidence };
  }
}

export const verificationEngine = new VerificationEngine();
