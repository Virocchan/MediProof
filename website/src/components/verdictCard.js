// Renders the Strict Verdict Result Card for everyday people checking online claims
// Matches the exact n8n prompt specification ([VERDICT], [EXPLANATION], [SOURCES]) with 1-click sharing & multilingual translation
import { SUPPORTED_LANGUAGES, translator } from '../services/translator.js';

export function renderVerdictCard(result) {
  if (!result) return '';

  const verdictLower = (result.verdict || 'unverified').toLowerCase();
  let bannerClass = 'verdict-banner-unverified';
  let iconSvg = '';
  let titleText = result.verdict;
  let subText = 'Checked against WHO, MOH & CDC Guidelines';

  if (verdictLower.includes('true')) {
    bannerClass = 'verdict-banner-true';
    iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
    titleText = 'VERIFIED: REAL & ACCURATE';
    subText = 'This statement is supported by medical facts and health guidelines.';
  } else if (verdictLower.includes('false')) {
    bannerClass = 'verdict-banner-false';
    iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
    titleText = 'ALERT: FAKE CLAIM / FALSE';
    subText = 'This claim is medically inaccurate and could be harmful to follow.';
  } else if (verdictLower.includes('misleading')) {
    bannerClass = 'verdict-banner-misleading';
    iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    titleText = 'WARNING: MISLEADING CLAIM';
    subText = 'Contains partial truth but exaggerates benefits or lacks clinical proof.';
  } else {
    bannerClass = 'verdict-banner-unverified';
    iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    titleText = 'UNVERIFIED / UNPROVEN';
    subText = 'Not enough scientific research to confirm whether this is safe or real.';
  }

  const sourcesHtml = (result.sources || []).map(source => `
    <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="source-authority-pill" title="Read official health authority source">
      <span class="authority-tag">${source.type || 'REF'}</span>
      <span>${source.name}</span>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
    </a>
  `).join('');

  // Share text for WhatsApp
  const shareMessage = encodeURIComponent(`🔍 MediProof Fact-Check Result:\n[VERDICT]: ${result.verdict}\n\n${result.explanation}\n\nSources: ${result.sources ? result.sources.map(s => s.name).join(', ') : 'WHO / MOH'}\nFact-checked on MediProof (SDG 3 Health Guard).`);

  return `
    <div class="verdict-result-card" id="active-verdict-card">
      <div class="verdict-header-banner ${bannerClass}">
        <div class="verdict-badge-big">
          <div class="verdict-icon-bubble">
            ${iconSvg}
          </div>
          <div>
            <div class="verdict-title-text" id="verdict-title-text">${titleText}</div>
            <div style="font-size: 0.82rem; opacity: 0.9;" id="verdict-subtitle-text">${subText}</div>
          </div>
        </div>
        <div class="verdict-confidence-box">
          <div class="confidence-val">${result.confidence}%</div>
          <div class="confidence-lbl">Consensus</div>
        </div>
      </div>

      <!-- Multilingual Translation Toolbar -->
      <div class="verdict-translate-bar">
        <div class="translate-bar-left">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--accent-primary);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <div>
            <div class="translate-bar-label">Translate Output</div>
            <div class="translate-bar-hint">Translate this fact-check into your preferred language</div>
          </div>
        </div>
        <div class="translate-bar-right">
          <select id="verdict-lang-select" class="translate-lang-select" aria-label="Translate Language">
            ${SUPPORTED_LANGUAGES.map(lang => `
              <option value="${lang.code}">${lang.flag} ${lang.label}</option>
            `).join('')}
          </select>
          <span id="translate-status-spinner" class="translate-loading-spinner" style="display: none;">
            <svg class="spin-animate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Translating...
          </span>
        </div>
      </div>

      <div class="verdict-section-block">
        <div class="verdict-section-label" id="verdict-why-header">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span>Why is this ${result.verdict}? (Plain Explanation)</span>
        </div>
        <div class="verdict-explanation-text" id="verdict-explanation-body">
          ${result.explanation}
        </div>
      </div>

      <div class="verdict-section-block">
        <div class="verdict-section-label" id="verdict-where-header">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <span>Where did we check this? (Official Health Registries)</span>
        </div>
        <div class="sources-pills-row">
          ${sourcesHtml}
        </div>
      </div>

      <div class="verdict-meta-bar">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="route-info-badge">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Checked in ${result.latency} via AI & Health Databases
          </span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="https://api.whatsapp.com/send?text=${shareMessage}" id="btn-whatsapp-share" target="_blank" rel="noopener noreferrer" class="filter-btn" style="color: #15803d; border-color: #bbf7d0; text-decoration: none;" title="Send fact-check to WhatsApp chat">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.182-.544-1.902-.788-3.125-2.73-3.22-2.857-.095-.128-.769-1.024-.769-1.953s.487-1.381.66-1.571c.174-.189.38-.237.507-.237.127 0 .254.001.365.006.118.005.276-.045.431.328.16.386.546 1.332.594 1.43.048.098.08.213.016.34-.064.127-.096.206-.19.317-.095.111-.2.247-.286.332-.095.095-.195.198-.084.388.111.19.493.813 1.057 1.316.726.648 1.338.85 1.528.945.19.095.302.079.413-.048.111-.127.476-.555.603-.746.127-.19.254-.158.428-.095.175.063 1.111.524 1.302.619.19.095.317.143.365.222.048.079.048.46-.096.865z"/></svg>
            Share on WhatsApp
          </a>

          <button class="filter-btn" id="btn-copy-verdict" title="Copy fact-check text to clipboard">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy Text
          </button>

          <button class="filter-btn" id="btn-export-report" title="Print or save as PDF">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Print / Save
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Attaches interactive translation, copy, and export actions to the verdict card
 */
export function initVerdictCard(container, result) {
  if (!container || !result) return;

  const langSelect = container.querySelector('#verdict-lang-select');
  const spinner = container.querySelector('#translate-status-spinner');
  const titleEl = container.querySelector('#verdict-title-text');
  const subTitleEl = container.querySelector('#verdict-subtitle-text');
  const whyHeaderEl = container.querySelector('#verdict-why-header span');
  const whereHeaderEl = container.querySelector('#verdict-where-header span');
  const explanationEl = container.querySelector('#verdict-explanation-body');
  const whatsappBtn = container.querySelector('#btn-whatsapp-share');
  const copyBtn = container.querySelector('#btn-copy-verdict');
  const printBtn = container.querySelector('#btn-export-report');

  let currentLang = 'en';
  let currentExplanation = result.explanation;

  // Language translation handler
  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      const targetLang = e.target.value;
      currentLang = targetLang;

      if (spinner) spinner.style.display = 'inline-flex';
      langSelect.disabled = true;

      try {
        // Translate dynamic explanation
        const translatedExplanation = await translator.translateExplanation(result.explanation, targetLang);
        currentExplanation = translatedExplanation;

        // Update DOM elements smoothly
        if (titleEl) titleEl.textContent = translator.getVerdictTitle(result.verdict, targetLang);
        if (subTitleEl) subTitleEl.textContent = translator.getVerdictSubtitle(result.verdict, targetLang);
        if (whyHeaderEl) whyHeaderEl.textContent = translator.getWhyHeader(result.verdict, targetLang);
        if (whereHeaderEl) whereHeaderEl.textContent = translator.getWhereHeader(targetLang);
        if (explanationEl) explanationEl.textContent = translatedExplanation;

        // Update WhatsApp share link with translated text
        if (whatsappBtn) {
          const translatedTitle = translator.getVerdictTitle(result.verdict, targetLang);
          const shareMsg = encodeURIComponent(`🔍 MediProof Fact-Check Result:\n[VERDICT]: ${translatedTitle}\n\n${translatedExplanation}\n\nSources: ${result.sources ? result.sources.map(s => s.name).join(', ') : 'WHO / MOH'}\nFact-checked on MediProof (SDG 3 Health Guard).`);
          whatsappBtn.href = `https://api.whatsapp.com/send?text=${shareMsg}`;
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        if (spinner) spinner.style.display = 'none';
        langSelect.disabled = false;
      }
    });
  }

  // Copy text button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const currentTitle = titleEl ? titleEl.textContent : result.verdict;
      const textToCopy = `MediProof Fact-Check:\n[VERDICT]: ${currentTitle}\n\n${currentExplanation}\n\nSources: ${result.sources ? result.sources.map(s => s.name).join(', ') : 'WHO / MOH'}`;
      navigator.clipboard.writeText(textToCopy);
      copyBtn.innerHTML = `✓ Copied!`;
      setTimeout(() => { copyBtn.innerHTML = `Copy Text`; }, 2000);
    });
  }

  // Print button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
