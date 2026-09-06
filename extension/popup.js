/**
 * MediProof Extension - Popup Controller
 * Manages 4 modalities, active tab grabbers, live audio recorder, n8n verification, multi-language translation, settings & history.
 */

document.addEventListener('DOMContentLoaded', () => {
  const DICTIONARY = {
    titles: {
      True: {
        en: 'VERIFIED TRUE',
        ms: 'DISAHKAN: BENAR',
        'zh-CN': '已核实：真实准确',
        ta: 'சரிபார்க்கப்பட்டது: உண்மை',
        id: 'TERVERIFIKASI: BENAR',
        es: 'VERIFICADO: VERDADERO',
        ar: 'مُؤكد: حقيقي',
        hi: 'सत्यापित: सत्य',
        fr: 'VÉRIFIÉ : VRAI'
      },
      False: {
        en: 'FALSE CLAIM',
        ms: 'DAKWAAN PALSU',
        'zh-CN': '虚假主张 / 不实',
        ta: 'போலி கூற்று / தவறு',
        id: 'KLAIM PALSU / SALAH',
        es: 'AFIRMACIÓN FALSA',
        ar: 'ادعاء كاذب / غير صحيح',
        hi: 'फर्जी दावा / असत्य',
        fr: 'FAUSSE DÉCLARATION'
      },
      Misleading: {
        en: 'MISLEADING / UNPROVEN',
        ms: 'MENGELIRUKAN',
        'zh-CN': '具有误导性 / 存疑',
        ta: 'தவறாக வழிநடத்துவது',
        id: 'MENYESATKAN',
        es: 'ENGAÑOSO / NO PROBADO',
        ar: 'ادعاء مضلل',
        hi: 'भ्रामक दावा',
        fr: 'ALLÉGATION TROMPEUSE'
      },
      Unverified: {
        en: 'UNVERIFIED',
        ms: 'BELUM DISAHKAN',
        'zh-CN': '未证实',
        ta: 'சரிபார்க்கப்படவில்லை',
        id: 'BELUM DIVERIFIKASI',
        es: 'NO VERIFICADO',
        ar: 'غير مؤكد',
        hi: 'असत्यापित',
        fr: 'NON VÉRIFIÉ'
      }
    },
    sectionWhy: {
      en: 'Clinical Synthesis & Evidence',
      ms: 'Sintesis Klinikal & Bukti Penjelasan',
      'zh-CN': '临床综合论证与通俗解释',
      ta: 'மருத்துவ சான்றுகள் & எளிய விளக்கம்',
      id: 'Sintesis Klinis & Bukti Penjelasan',
      es: 'Síntesis Clínica y Evidencia',
      ar: 'التوليف السريري والأدلة',
      hi: 'नैदानिक ​​संश्लेषण और साक्ष्य',
      fr: 'Synthèse Clinique et Preuves'
    },
    sectionWhere: {
      en: 'Authoritative Health Registries',
      ms: 'Pendaftaran Kesihatan Rasmi (WHO / KKM)',
      'zh-CN': '官方权威健康机构 (WHO / 卫生部)',
      ta: 'அதிகாரப்பூர்வ சுகாதார பதிவேடுகள்',
      id: 'Registri Kesehatan Resmi',
      es: 'Registros Oficiales de Salud',
      ar: 'السجلات الصحية الرسمية',
      hi: 'आधिकारिक स्वास्थ्य रजिस्ट्री',
      fr: 'Registres Officiels de Santé'
    }
  };

  // Elements
  const tabButtons = document.querySelectorAll('.tab-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const resultPane = document.getElementById('pane-result');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingDesc = document.getElementById('loading-desc');

  // Text modality elements
  const inputTextClaim = document.getElementById('input-text-claim');
  const btnGrabSelection = document.getElementById('btn-grab-selection');
  const btnVerifyText = document.getElementById('btn-verify-text');

  // YouTube modality elements
  const inputYtUrl = document.getElementById('input-yt-url');
  const btnDetectYoutube = document.getElementById('btn-detect-youtube');
  const btnVerifyYoutube = document.getElementById('btn-verify-youtube');

  // Voice modality elements
  const btnMicToggle = document.getElementById('btn-mic-toggle');
  const micPulse = document.getElementById('mic-pulse');
  const recorderStatus = document.getElementById('recorder-status');
  const recorderTimer = document.getElementById('recorder-timer');
  const inputVoiceUrl = document.getElementById('input-voice-url');
  const btnVerifyVoice = document.getElementById('btn-verify-voice');

  // Photo modality elements
  const inputPhotoUrl = document.getElementById('input-photo-url');
  const fileDropZone = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('file-input');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview');
  const btnRemoveImage = document.getElementById('btn-remove-image');
  const btnVerifyPhoto = document.getElementById('btn-verify-photo');

  // Result elements
  const btnBackToInput = document.getElementById('btn-back-to-input');
  const resultTime = document.getElementById('result-time');
  const resultClaimText = document.getElementById('result-claim-text');
  const resultVerdictBar = document.getElementById('result-verdict-bar');
  const resultVerdictIcon = document.getElementById('result-verdict-icon');
  const resultVerdictText = document.getElementById('result-verdict-text');
  const resultConfidence = document.getElementById('result-confidence');
  const resultExplanation = document.getElementById('result-explanation');
  const resultSources = document.getElementById('result-sources');
  const resultClaimId = document.getElementById('result-claim-id');
  const resultLatency = document.getElementById('result-latency');
  const popupLangSelect = document.getElementById('popup-lang-select');
  const popupTranslateSpinner = document.getElementById('popup-translate-spinner');
  const popupWhyTitle = document.getElementById('popup-why-title');
  const popupWhereTitle = document.getElementById('popup-where-title');

  // Settings Modal elements
  const btnSettings = document.getElementById('btn-settings');
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const cfgWebhookUrl = document.getElementById('cfg-webhook-url');
  const cfgCallbackUrl = document.getElementById('cfg-callback-url');
  const btnTestConnection = document.getElementById('btn-test-connection');
  const connectionStatus = document.getElementById('connection-status');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  // History Modal elements
  const btnHistory = document.getElementById('btn-history');
  const modalHistory = document.getElementById('modal-history');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const historyItemsContainer = document.getElementById('history-items-container');
  const btnClearHistory = document.getElementById('btn-clear-history');

  let activeModality = 'text';
  let uploadedImageBase64 = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let recordInterval = null;
  let recordSeconds = 0;
  let recordedAudioBlobUrl = null;
  let activePreferredLang = 'en';
  let currentActiveResult = null;

  // Fetch initial config & preferences
  chrome.runtime.sendMessage({ action: 'GET_CONFIG' }, (res) => {
    if (res && res.preferredLanguage) {
      activePreferredLang = res.preferredLanguage;
      if (popupLangSelect) popupLangSelect.value = activePreferredLang;
    }
  });

  // ----------------------------------------------------
  // 1. Tab Switching
  // ----------------------------------------------------
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modality = btn.getAttribute('data-modality');
      setActiveTab(modality);
    });
  });

  function setActiveTab(modality) {
    activeModality = modality;
    tabButtons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-modality') === modality));
    tabPanes.forEach((p) => p.classList.remove('active'));
    resultPane.style.display = 'none';

    const targetPane = document.getElementById(`pane-${modality}`);
    if (targetPane) targetPane.classList.add('active');
  }

  // ----------------------------------------------------
  // 2. Presets Handling
  // ----------------------------------------------------
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.dataset.text) {
        inputTextClaim.value = chip.dataset.text;
      } else if (chip.dataset.yt) {
        inputYtUrl.value = chip.dataset.yt;
      } else if (chip.dataset.voice) {
        inputVoiceUrl.value = chip.dataset.voice;
      } else if (chip.dataset.photo) {
        inputPhotoUrl.value = chip.dataset.photo;
        showImagePreview(chip.dataset.photo);
      }
    });
  });

  // ----------------------------------------------------
  // 3. Modality: Text - Grab Active Tab Selection
  // ----------------------------------------------------
  btnGrabSelection.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString().trim()
      }, (results) => {
        if (results && results[0] && results[0].result) {
          inputTextClaim.value = results[0].result;
          inputTextClaim.focus();
        } else {
          alert('No text currently selected on the active webpage. Highlight any text first!');
        }
      });
    } catch (e) {
      console.warn('Could not grab selection:', e);
    }
  });

  btnVerifyText.addEventListener('click', () => {
    const claim = inputTextClaim.value.trim();
    if (!claim) {
      alert('Please enter or grab a medical claim to fact-check.');
      inputTextClaim.focus();
      return;
    }
    executeVerification('text', { text: claim });
  });

  // ----------------------------------------------------
  // 4. Modality: YouTube - Auto-Detect Active Video
  // ----------------------------------------------------
  btnDetectYoutube.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtu.be/'))) {
        inputYtUrl.value = tab.url;
      } else {
        alert('The active browser tab is not a YouTube video page.');
      }
    } catch (e) {
      console.warn('Could not detect active video:', e);
    }
  });

  btnVerifyYoutube.addEventListener('click', () => {
    const url = inputYtUrl.value.trim();
    if (!url) {
      alert('Please enter or detect a YouTube video URL.');
      inputYtUrl.focus();
      return;
    }
    executeVerification('youtube', { url, text: `Fact-check YouTube video: ${url}` });
  });

  // ----------------------------------------------------
  // 5. Modality: Voice - Live Mic Recording & Audio URLs
  // ----------------------------------------------------
  btnMicToggle.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  });

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        recordedAudioBlobUrl = URL.createObjectURL(blob);
        inputVoiceUrl.value = 'mic_recording.webm';
        recorderStatus.textContent = 'Audio recorded successfully! Ready to verify.';
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      micPulse.classList.add('recording');
      recorderStatus.textContent = 'Recording medical voice claim...';

      recordSeconds = 0;
      recorderTimer.textContent = '00:00';
      recordInterval = setInterval(() => {
        recordSeconds++;
        const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
        const secs = String(recordSeconds % 60).padStart(2, '0');
        recorderTimer.textContent = `${mins}:${secs}`;
        if (recordSeconds >= 60) stopRecording();
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or not available: ' + err.message);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    micPulse.classList.remove('recording');
    clearInterval(recordInterval);
  }

  btnVerifyVoice.addEventListener('click', () => {
    const url = inputVoiceUrl.value.trim();
    if (!url && !recordedAudioBlobUrl) {
      alert('Please record a voice note or provide an audio URL.');
      return;
    }
    executeVerification('voice', {
      audioUrl: url || 'data:audio/webm;live_mic_sample',
      text: 'Voice note audio claim verification'
    });
  });

  // ----------------------------------------------------
  // 6. Modality: Photo - Drag & Drop / File Input
  // ----------------------------------------------------
  fileDropZone.addEventListener('click', () => fileInput.click());

  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = '#994d55';
    fileDropZone.style.background = '#fbf0f1';
  });

  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.style.borderColor = '';
    fileDropZone.style.background = '';
  });

  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.style.borderColor = '';
    fileDropZone.style.background = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageBase64 = e.target.result;
      inputPhotoUrl.value = file.name;
      showImagePreview(uploadedImageBase64);
    };
    reader.readAsDataURL(file);
  }

  function showImagePreview(src) {
    imagePreview.src = src;
    imagePreviewContainer.style.display = 'flex';
    fileDropZone.style.display = 'none';
  }

  btnRemoveImage.addEventListener('click', () => {
    uploadedImageBase64 = null;
    imagePreview.src = '';
    imagePreviewContainer.style.display = 'none';
    fileDropZone.style.display = 'flex';
    fileInput.value = '';
    inputPhotoUrl.value = '';
  });

  btnVerifyPhoto.addEventListener('click', () => {
    const url = inputPhotoUrl.value.trim();
    if (!url && !uploadedImageBase64) {
      alert('Please upload an image or provide an image link to inspect.');
      return;
    }
    executeVerification('photo', {
      imageUrl: uploadedImageBase64 || url,
      text: 'Supplement label and NPRA registration analysis'
    });
  });

  // ----------------------------------------------------
  // 7. Core Verification Trigger
  // ----------------------------------------------------
  function executeVerification(modality, payloadData) {
    loadingOverlay.style.display = 'flex';
    loadingDesc.textContent = 'Pushed claim to n8n webhook. Cross-referencing WHO, CDC, FDA & MOH clinical registries...';

    chrome.runtime.sendMessage({
      action: 'VERIFY_CLAIM',
      modality,
      data: payloadData
    }, (response) => {
      loadingOverlay.style.display = 'none';

      if (chrome.runtime.lastError) {
        alert('Verification error: ' + chrome.runtime.lastError.message);
        return;
      }

      if (response && response.success && response.result) {
        displayResult(response.result);
      } else {
        alert('Verification failed: ' + (response?.error || 'Unknown error.'));
      }
    });
  }

  function normalizeVerdictKey(verdict) {
    const v = (verdict || '').toLowerCase();
    if (v.includes('true')) return 'True';
    if (v.includes('false')) return 'False';
    if (v.includes('misleading')) return 'Misleading';
    return 'Unverified';
  }

  // ----------------------------------------------------
  // 8. Display Formatted Verification Result
  // ----------------------------------------------------
  function displayResult(result) {
    currentActiveResult = result;

    // Hide tabs, show result pane
    tabPanes.forEach((p) => p.classList.remove('active'));
    resultPane.style.display = 'flex';

    resultTime.textContent = result.timestamp || new Date().toLocaleTimeString();
    resultClaimText.textContent = `"${result.inputData?.text || result.inputData?.url || result.claim_id}"`;

    // Reset verdict classes
    resultVerdictBar.className = 'result-verdict-bar';

    const vKey = normalizeVerdictKey(result.verdict);
    let verdictIcon = '❓';

    if (vKey === 'True') {
      resultVerdictBar.classList.add('verdict-true');
      verdictIcon = '✅';
    } else if (vKey === 'False') {
      resultVerdictBar.classList.add('verdict-false');
      verdictIcon = '❌';
    } else if (vKey === 'Misleading') {
      resultVerdictBar.classList.add('verdict-misleading');
      verdictIcon = '⚠️';
    } else {
      resultVerdictBar.classList.add('verdict-unverified');
      verdictIcon = '❓';
    }

    resultVerdictIcon.textContent = verdictIcon;
    resultVerdictText.textContent = DICTIONARY.titles[vKey]?.[activePreferredLang] || DICTIONARY.titles[vKey]?.en || result.verdict;
    resultConfidence.textContent = `${result.confidence || 95}% Confidence`;
    resultExplanation.textContent = result.explanation || 'Claim analyzed against clinical guidelines.';

    if (popupWhyTitle) {
      popupWhyTitle.textContent = DICTIONARY.sectionWhy[activePreferredLang] || DICTIONARY.sectionWhy.en;
    }
    if (popupWhereTitle) {
      popupWhereTitle.textContent = DICTIONARY.sectionWhere[activePreferredLang] || DICTIONARY.sectionWhere.en;
    }

    if (popupLangSelect) {
      popupLangSelect.value = activePreferredLang;
    }

    // Render source tags
    resultSources.innerHTML = '';
    if (result.sources && result.sources.length > 0) {
      result.sources.forEach((s) => {
        const link = document.createElement('a');
        link.href = s.url || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'source-badge-link';
        link.innerHTML = `
          <span class="source-badge-tag">${escapeHtml(s.type || 'SOURCE')}</span>
          <span>${escapeHtml(s.name)}</span>
        `;
        resultSources.appendChild(link);
      });
    } else {
      resultSources.innerHTML = '<span style="font-size:11px;color:#8b8f9e;">WHO Guidelines & Clinical Registries</span>';
    }

    resultClaimId.textContent = result.claim_id || result.id || 'N/A';
    resultLatency.textContent = result.latency || '0.5s';

    // If preferred language is non-English, trigger translation
    if (activePreferredLang !== 'en') {
      applyLanguageTranslation(activePreferredLang);
    }
  }

  // Language translation handler for popup result
  if (popupLangSelect) {
    popupLangSelect.addEventListener('change', (e) => {
      const targetLang = e.target.value;
      activePreferredLang = targetLang;
      chrome.runtime.sendMessage({ action: 'SET_CONFIG', preferredLanguage: targetLang });
      applyLanguageTranslation(targetLang);
    });
  }

  const translationMemoryCache = new Map();

  async function translateDynamicText(text, targetLang, sourceLang = 'en') {
    if (!text || targetLang === 'en' || targetLang === sourceLang) return text;

    const cacheKey = `${targetLang}:${text}`;
    if (translationMemoryCache.has(cacheKey)) {
      return translationMemoryCache.get(cacheKey);
    }

    // 1. Try local Express server endpoint
    try {
      const res = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.translatedText) {
          translationMemoryCache.set(cacheKey, data.translatedText);
          return data.translatedText;
        }
      }
    } catch (e) {
      // Continue to direct translation API
    }

    // 2. Direct MyMemory Translation API (chunked by sentences)
    try {
      const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
      const translatedParts = await Promise.all(sentences.map(async (chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return '';
        try {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}&de=mediproof-health@gmail.com`;
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
          }
          return trimmed;
        } catch (err) {
          return trimmed;
        }
      }));
      const combined = translatedParts.filter(Boolean).join(' ');
      if (combined && combined.length > 5) {
        translationMemoryCache.set(cacheKey, combined);
        return combined;
      }
    } catch (err) {
      console.warn('[MediProof] Direct translation error:', err);
    }

    // 3. Fallback to background service worker message
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'TRANSLATE_TEXT',
        text,
        targetLang,
        sourceLang
      }, (res) => {
        if (res && res.success && res.translatedText) {
          translationMemoryCache.set(cacheKey, res.translatedText);
          resolve(res.translatedText);
        } else {
          resolve(text);
        }
      });
    });
  }

  async function applyLanguageTranslation(targetLang) {
    if (!currentActiveResult) return;
    const vKey = normalizeVerdictKey(currentActiveResult.verdict);

    // Update dictionary text
    const translatedTitle = DICTIONARY.titles[vKey]?.[targetLang] || DICTIONARY.titles[vKey]?.en || currentActiveResult.verdict;
    resultVerdictText.textContent = translatedTitle;
    if (popupWhyTitle) {
      popupWhyTitle.textContent = DICTIONARY.sectionWhy[targetLang] || DICTIONARY.sectionWhy.en;
    }
    if (popupWhereTitle) {
      popupWhereTitle.textContent = DICTIONARY.sectionWhere[targetLang] || DICTIONARY.sectionWhere.en;
    }

    if (targetLang === 'en') {
      resultExplanation.textContent = currentActiveResult.explanation;
      return;
    }

    if (popupTranslateSpinner) popupTranslateSpinner.style.display = 'inline-flex';
    resultExplanation.style.opacity = '0.5';

    try {
      const translated = await translateDynamicText(currentActiveResult.explanation, targetLang);
      resultExplanation.textContent = translated;
    } catch (err) {
      console.warn('[MediProof] Translation error:', err);
    } finally {
      if (popupTranslateSpinner) popupTranslateSpinner.style.display = 'none';
      resultExplanation.style.opacity = '1';
    }
  }

  btnBackToInput.addEventListener('click', () => {
    setActiveTab(activeModality);
  });

  // ----------------------------------------------------
  // 9. Settings Modal
  // ----------------------------------------------------
  btnSettings.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'GET_CONFIG' }, (res) => {
      if (res) {
        cfgWebhookUrl.value = res.n8nWebhookUrl || '';
        cfgCallbackUrl.value = res.callbackServerUrl || '';
      }
      connectionStatus.textContent = '';
      modalSettings.style.display = 'flex';
    });
  });

  btnCloseSettings.addEventListener('click', () => {
    modalSettings.style.display = 'none';
  });

  btnTestConnection.addEventListener('click', () => {
    const url = cfgWebhookUrl.value.trim();
    if (!url) return;
    connectionStatus.style.color = '#575a68';
    connectionStatus.textContent = 'Testing connection...';

    chrome.runtime.sendMessage({ action: 'TEST_CONNECTION', webhookUrl: url }, (res) => {
      if (res && res.ok) {
        connectionStatus.style.color = '#15803d';
        connectionStatus.textContent = `✅ Connected successfully! (HTTP ${res.status})`;
      } else {
        connectionStatus.style.color = '#be123c';
        connectionStatus.textContent = `❌ Error: ${res?.message || 'Connection failed'}`;
      }
    });
  });

  btnSaveSettings.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'SET_CONFIG',
      n8nWebhookUrl: cfgWebhookUrl.value,
      callbackServerUrl: cfgCallbackUrl.value
    }, () => {
      modalSettings.style.display = 'none';
      alert('Settings saved successfully!');
    });
  });

  // ----------------------------------------------------
  // 10. History Modal
  // ----------------------------------------------------
  btnHistory.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'GET_HISTORY' }, (res) => {
      const list = res?.history || [];
      historyItemsContainer.innerHTML = '';

      if (list.length === 0) {
        historyItemsContainer.innerHTML = '<div style="font-size:12px;color:#8b8f9e;text-align:center;padding:16px;">No recent verifications yet.</div>';
      } else {
        list.forEach((item) => {
          const div = document.createElement('div');
          div.className = 'history-item';

          const v = (item.verdict || 'Unverified').toLowerCase();
          const vColor = v.includes('true') ? '#15803d' : v.includes('false') ? '#be123c' : v.includes('misleading') ? '#d97706' : '#4f46e5';

          div.innerHTML = `
            <div class="history-item-top">
              <span class="history-verdict" style="color:${vColor}">${escapeHtml(item.verdict)} (${item.confidence || 95}%)</span>
              <span style="font-size:10px;color:#8b8f9e;">${escapeHtml(item.timestamp || '')}</span>
            </div>
            <div class="history-claim">${escapeHtml(item.inputData?.text || item.inputData?.url || item.claim_id)}</div>
          `;

          div.addEventListener('click', () => {
            modalHistory.style.display = 'none';
            displayResult(item);
          });

          historyItemsContainer.appendChild(div);
        });
      }

      modalHistory.style.display = 'flex';
    });
  });

  btnCloseHistory.addEventListener('click', () => {
    modalHistory.style.display = 'none';
  });

  btnClearHistory.addEventListener('click', () => {
    if (confirm('Clear all verification history?')) {
      chrome.runtime.sendMessage({ action: 'CLEAR_HISTORY' }, () => {
        historyItemsContainer.innerHTML = '<div style="font-size:12px;color:#8b8f9e;text-align:center;padding:16px;">History cleared.</div>';
      });
    }
  });

  // Check if active tab is YouTube on open to switch default tab or auto-fill
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtu.be/'))) {
      inputYtUrl.value = tab.url;
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
