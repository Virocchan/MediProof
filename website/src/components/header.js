// Header Component matching reference UI

import { verificationEngine } from '../services/verificationEngine.js';

export class HeaderComponent {
  constructor(container, onQuickVerify, onSearch) {
    this.container = container;
    this.onQuickVerify = onQuickVerify;
    this.onSearch = onSearch;
  }

  updateEngineStatus() {
    const status = verificationEngine.getEngineStatus();
    const labelEl = this.container.querySelector('#header-engine-label');
    if (labelEl) labelEl.textContent = status.label;
  }

  render() {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const status = verificationEngine.getEngineStatus();

    this.container.innerHTML = `
      <header class="header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <button class="header-btn icon-only" id="btn-toggle-mobile-sidebar" style="display: none;" title="Toggle Sidebar">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div class="header-search-bar">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" id="global-search-input" placeholder="Search claims, supplement codes, WHO facts..." />
          </div>
        </div>

        <div class="header-actions">
          <div class="workflow-status-pill" title="Verification Engine State">
            <span class="pulse-dot"></span>
            <span id="header-engine-label">${status.label}</span>
          </div>

          <div class="header-btn" style="cursor: default;">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>${formattedDate}</span>
          </div>

          <button class="header-btn icon-only" id="btn-notifications" title="System Notifications">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span class="notif-badge-indicator"></span>
          </button>

          <button class="header-btn icon-only" id="btn-open-settings" title="Preferences & Settings">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>

          <button class="header-cta-btn" id="btn-header-verify">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span>Verify Claim</span>
          </button>
        </div>
      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const verifyBtn = this.container.querySelector('#btn-header-verify');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        if (this.onQuickVerify) this.onQuickVerify();
      });
    }

    const searchInput = this.container.querySelector('#global-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q && this.onSearch) this.onSearch(q);
        }
      });
    }

    const settingsBtn = this.container.querySelector('#btn-open-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-settings-modal'));
      });
    }

    const notifBtn = this.container.querySelector('#btn-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        alert('MediProof Alert Feed:\n- New WHO guideline updated on sodium thresholds.\n- 3 viral TikTok videos flagged for fake cancer therapies.\n- n8n Webhook ready for live dispatch.');
      });
    }

    // Responsive toggle
    const toggleBtn = this.container.querySelector('#btn-toggle-mobile-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }
  }
}
