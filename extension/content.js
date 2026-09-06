/**
 * MediProof In-Page Content Script
 * 1. Floating text selection trigger pill [🛡️ Verify Claim]
 * 2. In-Page Sliding Verdict Dock with Multi-Language Translation
 * 3. YouTube action bar button injection
 */

(function () {
  if (window.__MEDIPROOF_INITIALIZED__) return;
  window.__MEDIPROOF_INITIALIZED__ = true;

  console.log('[MediProof] In-page content script loaded.');

  const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English (Original)', flag: '🇺🇸' },
    { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'zh-CN', label: '简体中文 (Chinese)', flag: '🇨🇳' },
    { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

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
      en: 'Why is this',
      ms: 'Mengapa ini',
      'zh-CN': '为什么是',
      ta: 'இது ஏன்',
      id: 'Mengapa ini',
      es: '¿Por qué esto es',
      ar: 'لماذا هذا',
      hi: 'यह क्यों है',
      fr: 'Pourquoi est-ce'
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

  // Global elements
  let rootContainer = null;
  let dockPanel = null;
  let selectionPill = null;
  let currentSelectionText = '';
  let activePreferredLang = 'en';

  // Read preferred language from storage
  chrome.runtime.sendMessage({ action: 'GET_CONFIG' }, (res) => {
    if (res && res.preferredLanguage) {
      activePreferredLang = res.preferredLanguage;
    }
  });

  // Initialize root container
  function initRoot() {
    if (rootContainer && document.body.contains(rootContainer)) return;
    rootContainer = document.createElement('div');
    rootContainer.id = 'mediproof-root';
    document.body.appendChild(rootContainer);
  }

  // ----------------------------------------------------
  // 1. Text Selection Trigger Pill
  // ----------------------------------------------------
  document.addEventListener('mouseup', (e) => {
    // Ignore clicks inside our own dock
    if (dockPanel && dockPanel.contains(e.target)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      // Only show if selection is substantial (>= 12 chars) and not empty
      if (text && text.length >= 12 && text.length <= 1500) {
        currentSelectionText = text;
        showSelectionPill(selection);
      } else {
        hideSelectionPill();
      }
    }, 20);
  });

  document.addEventListener('mousedown', (e) => {
    if (selectionPill && !selectionPill.contains(e.target)) {
      hideSelectionPill();
    }
  });

  function showSelectionPill(selection) {
    initRoot();
    hideSelectionPill();

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      selectionPill = document.createElement('div');
      selectionPill.className = 'mediproof-selection-pill';
      selectionPill.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09L17.5 10 11 16.5z"/></svg>
        <span>Verify with MediProof</span>
      `;

      // Position above selection
      const top = Math.max(10, rect.top - 42);
      const left = Math.min(window.innerWidth - 180, Math.max(10, rect.left + rect.width / 2 - 80));

      selectionPill.style.top = `${top}px`;
      selectionPill.style.left = `${left}px`;
      selectionPill.style.position = 'fixed';

      selectionPill.addEventListener('click', (e) => {
        e.stopPropagation();
        hideSelectionPill();
        triggerVerification('text', { text: currentSelectionText });
      });

      rootContainer.appendChild(selectionPill);
    } catch (err) {
      console.warn('[MediProof] Could not position selection pill:', err);
    }
  }

  function hideSelectionPill() {
    if (selectionPill && selectionPill.parentNode) {
      selectionPill.parentNode.removeChild(selectionPill);
    }
    selectionPill = null;
  }

  // ----------------------------------------------------
  // 2. In-Page Sliding Verdict Dock
  // ----------------------------------------------------
  function ensureDock() {
    initRoot();
    if (dockPanel && dockPanel.parentNode) return dockPanel;

    dockPanel = document.createElement('div');
    dockPanel.className = 'mediproof-dock-panel';
    dockPanel.innerHTML = `
      <div class="mediproof-dock-header">
        <div class="mediproof-brand-lockup">
          <div class="mediproof-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09L17.5 10 11 16.5z"/></svg>
          </div>
          <div>
            <span class="mediproof-brand-title">MediProof</span>
            <span class="mediproof-brand-subtitle">SDG 3</span>
          </div>
        </div>
        <div class="mediproof-dock-actions">
          <button class="mediproof-icon-btn" id="mediproof-btn-close" title="Close Panel">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="mediproof-dock-body" id="mediproof-dock-body"></div>
    `;

    rootContainer.appendChild(dockPanel);

    dockPanel.querySelector('#mediproof-btn-close').addEventListener('click', () => {
      closeDock();
    });

    return dockPanel;
  }

  function openDock(loading = true, modality = 'text', claimText = '') {
    const dock = ensureDock();
    const body = dock.querySelector('#mediproof-dock-body');

    dock.classList.add('mediproof-dock-open');

    if (loading) {
      const modeLabel = modality === 'youtube' ? 'YouTube Video Claim' : modality === 'photo' ? 'Supplement / NPRA Label' : 'Medical Text Claim';
      body.innerHTML = `
        <div class="mediproof-claim-quote">
          "${escapeHtml(claimText || 'Medical claim from current page')}"
          <div class="mediproof-claim-meta">
            <span>Modality: ${modeLabel}</span>
          </div>
        </div>
        <div class="mediproof-loading-state">
          <div class="mediproof-spinner"></div>
          <div class="mediproof-loading-title">Cross-Examining Clinical Registries...</div>
          <div class="mediproof-loading-sub">Dispatching claim to n8n AI engine & cross-referencing WHO, CDC, FDA, and MOH databases.</div>
        </div>
      `;
    }
  }

  function closeDock() {
    if (dockPanel) {
      dockPanel.classList.remove('mediproof-dock-open');
    }
  }

  function normalizeVerdictKey(verdict) {
    const v = (verdict || '').toLowerCase();
    if (v.includes('true')) return 'True';
    if (v.includes('false')) return 'False';
    if (v.includes('misleading')) return 'Misleading';
    return 'Unverified';
  }

  function renderResultInDock(result, modality = 'text', claimText = '') {
    const dock = ensureDock();
    dock.classList.add('mediproof-dock-open');
    const body = dock.querySelector('#mediproof-dock-body');

    const vKey = normalizeVerdictKey(result.verdict);
    let verdictClass = 'mediproof-verdict-unverified';
    let verdictIcon = '❓';

    if (vKey === 'True') {
      verdictClass = 'mediproof-verdict-true';
      verdictIcon = '✅';
    } else if (vKey === 'False') {
      verdictClass = 'mediproof-verdict-false';
      verdictIcon = '❌';
    } else if (vKey === 'Misleading') {
      verdictClass = 'mediproof-verdict-misleading';
      verdictIcon = '⚠️';
    }

    const claimDisplay = claimText || result.inputData?.text || result.inputData?.url || result.claim_id || 'Submitted claim';

    // Sources HTML
    const sourcesHtml = (result.sources && result.sources.length > 0)
      ? result.sources.map(s => `
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="mediproof-source-pill">
            <span class="mediproof-source-tag">${escapeHtml(s.type || 'SOURCE')}</span>
            <span>${escapeHtml(s.name)}</span>
          </a>
        `).join('')
      : '<span style="font-size:11.5px;color:#8b8f9e;">WHO Guidelines & Clinical Practice Registries</span>';

    // Build language options HTML
    const langOptionsHtml = SUPPORTED_LANGUAGES.map(l => `
      <option value="${l.code}" ${l.code === activePreferredLang ? 'selected' : ''}>${l.flag} ${l.label}</option>
    `).join('');

    body.innerHTML = `
      <div class="mediproof-claim-quote">
        "${escapeHtml(claimDisplay)}"
        <div class="mediproof-claim-meta">
          <span>Claim ID: ${escapeHtml(result.claim_id || result.id || 'N/A')}</span> • <span>${result.latency || '0.5s'}</span>
        </div>
      </div>

      <div class="mediproof-verdict-banner ${verdictClass}">
        <div class="mediproof-verdict-badge">
          <span>${verdictIcon}</span>
          <span id="mediproof-dock-verdict-title">${escapeHtml(DICTIONARY.titles[vKey]?.[activePreferredLang] || DICTIONARY.titles[vKey]?.en || result.verdict)}</span>
        </div>
        <div class="mediproof-confidence-badge">${result.confidence || 95}% Confidence</div>
      </div>

      <!-- Translation Selector Bar -->
      <div class="mediproof-translate-bar">
        <div class="mediproof-translate-left">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <span>Language:</span>
        </div>
        <div class="mediproof-translate-right">
          <select class="mediproof-lang-select" id="mediproof-dock-lang-select">
            ${langOptionsHtml}
          </select>
          <span class="mediproof-translate-spinner" id="mediproof-dock-translate-spinner" style="display:none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
          </span>
        </div>
      </div>

      <div>
        <div class="mediproof-section-label" id="mediproof-dock-why-label">
          ${DICTIONARY.sectionWhy[activePreferredLang] || DICTIONARY.sectionWhy.en} (${DICTIONARY.titles[vKey]?.[activePreferredLang] || result.verdict})
        </div>
        <div class="mediproof-explanation-text" id="mediproof-dock-explanation-text">
          ${escapeHtml(result.explanation || 'No detailed rationale returned.')}
        </div>
      </div>

      <div>
        <div class="mediproof-section-label" id="mediproof-dock-where-label">
          ${DICTIONARY.sectionWhere[activePreferredLang] || DICTIONARY.sectionWhere.en}
        </div>
        <div class="mediproof-sources-grid">
          ${sourcesHtml}
        </div>
      </div>

      <div class="mediproof-dock-footer">
        <span class="mediproof-sdg-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          SDG 3: Good Health
        </span>
        <span>${escapeHtml(result.timestamp || '')}</span>
      </div>
    `;

    // Hook up translation dropdown listener
    const langSelect = body.querySelector('#mediproof-dock-lang-select');
    const translateSpinner = body.querySelector('#mediproof-dock-translate-spinner');
    const titleEl = body.querySelector('#mediproof-dock-verdict-title');
    const whyLabel = body.querySelector('#mediproof-dock-why-label');
    const whereLabel = body.querySelector('#mediproof-dock-where-label');
    const explanationEl = body.querySelector('#mediproof-dock-explanation-text');

    if (langSelect) {
      langSelect.addEventListener('change', async (e) => {
        const targetLang = e.target.value;
        activePreferredLang = targetLang;
        chrome.runtime.sendMessage({ action: 'SET_CONFIG', preferredLanguage: targetLang });

        // Update instant dictionary labels
        const translatedTitle = DICTIONARY.titles[vKey]?.[targetLang] || DICTIONARY.titles[vKey]?.en || result.verdict;
        if (titleEl) titleEl.textContent = translatedTitle;
        if (whyLabel) whyLabel.textContent = `${DICTIONARY.sectionWhy[targetLang] || DICTIONARY.sectionWhy.en} (${translatedTitle})`;
        if (whereLabel) whereLabel.textContent = DICTIONARY.sectionWhere[targetLang] || DICTIONARY.sectionWhere.en;

        if (targetLang === 'en') {
          if (explanationEl) explanationEl.textContent = result.explanation;
          return;
        }

        // Translate dynamic clinical explanation directly
        if (translateSpinner) translateSpinner.style.display = 'inline-flex';
        explanationEl.style.opacity = '0.5';

        try {
          const translated = await translateDynamicText(result.explanation, targetLang);
          explanationEl.textContent = translated;
        } catch (err) {
          console.warn('[MediProof] Dock translation error:', err);
        } finally {
          if (translateSpinner) translateSpinner.style.display = 'none';
          explanationEl.style.opacity = '1';
        }
      });

      // If preferred language is not English on initial render, trigger auto-translation
      if (activePreferredLang !== 'en') {
        langSelect.dispatchEvent(new Event('change'));
      }
    }
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

    return text;
  }

  function renderErrorInDock(errorMsg, claimText = '') {
    const dock = ensureDock();
    dock.classList.add('mediproof-dock-open');
    const body = dock.querySelector('#mediproof-dock-body');

    body.innerHTML = `
      <div class="mediproof-claim-quote">
        "${escapeHtml(claimText || 'Submitted Claim')}"
      </div>
      <div class="mediproof-verdict-banner mediproof-verdict-false">
        <div class="mediproof-verdict-badge">
          <span>⚠️</span>
          <span>Verification Notice</span>
        </div>
      </div>
      <div class="mediproof-explanation-text" style="color:#9f1239;background:#fff1f2;">
        ${escapeHtml(errorMsg || 'Unable to communicate with the n8n webhook.')}
      </div>
    `;
  }

  // Helper to trigger verification through background service worker
  function triggerVerification(modality, data) {
    openDock(true, modality, data.text || data.url || 'Medical claim verification');
    chrome.runtime.sendMessage({
      action: 'VERIFY_CLAIM',
      modality,
      data
    }, (response) => {
      if (chrome.runtime.lastError) {
        renderErrorInDock(chrome.runtime.lastError.message, data.text);
      } else if (response && response.success) {
        renderResultInDock(response.result, modality, data.text);
      } else {
        renderErrorInDock(response?.error || 'Verification failed', data.text);
      }
    });
  }

  // ----------------------------------------------------
  // 3. YouTube In-Page Fact-Check Button Injection
  // ----------------------------------------------------
  function tryInjectYouTubeButton() {
    if (!window.location.hostname.includes('youtube.com') || !window.location.pathname.startsWith('/watch')) {
      return;
    }

    if (document.getElementById('mediproof-yt-factcheck-btn')) return;

    // Search for YouTube action buttons container
    const actionsTarget = document.querySelector('#actions #top-level-buttons-computed, #top-level-buttons, ytd-menu-renderer');
    if (!actionsTarget) return;

    const btn = document.createElement('button');
    btn.id = 'mediproof-yt-factcheck-btn';
    btn.className = 'mediproof-yt-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09L17.5 10 11 16.5z"/></svg>
      <span>MediProof Fact-Check</span>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const videoTitleElem = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, #title h1');
      const title = videoTitleElem ? videoTitleElem.textContent.trim() : document.title.replace('- YouTube', '').trim();
      const videoUrl = window.location.href;

      triggerVerification('youtube', { url: videoUrl, text: `YouTube: ${title}` });
    });

    actionsTarget.parentNode.insertBefore(btn, actionsTarget);
    console.log('[MediProof] Injected Fact-Check button into YouTube.');
  }

  // Observe YouTube DOM for SPA navigations
  if (window.location.hostname.includes('youtube.com')) {
    const observer = new MutationObserver(() => {
      tryInjectYouTubeButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('yt-navigate-finish', tryInjectYouTubeButton);
    setTimeout(tryInjectYouTubeButton, 1500);
  }

  // ----------------------------------------------------
  // 4. Listen for Messages from Background Worker
  // ----------------------------------------------------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'MEDIPROOF_OPEN_DOCK') {
      openDock(msg.loading, msg.modality, msg.claimText);
      sendResponse({ received: true });
    } else if (msg.action === 'MEDIPROOF_SHOW_RESULT') {
      renderResultInDock(msg.result, msg.modality, msg.claimText);
      sendResponse({ received: true });
    } else if (msg.action === 'MEDIPROOF_SHOW_ERROR') {
      renderErrorInDock(msg.error, msg.claimText);
      sendResponse({ received: true });
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
})();
