// Normal Consumer / Community Settings & Preferences Modal

export function openSettingsModal(onSaveCallback) {
  const existing = document.getElementById('settings-modal-wrapper');
  if (existing) existing.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'settings-modal-wrapper';
  modalEl.className = 'modal-backdrop';

  const userName = localStorage.getItem('mediproof_user_name') || 'Alex Morgan';
  const userRole = localStorage.getItem('mediproof_user_role') || 'Community Member';
  const userLang = localStorage.getItem('mediproof_user_lang') || 'en';
  const primaryAuth = localStorage.getItem('mediproof_primary_auth') || 'MOH';
  const alertViral = localStorage.getItem('mediproof_alert_viral') !== 'false';
  const plainLanguage = localStorage.getItem('mediproof_plain_language') !== 'false';
  const autoSave = localStorage.getItem('mediproof_auto_save') !== 'false';

  modalEl.innerHTML = `
    <div class="modal-dialog" style="max-width: 580px;">
      <div class="modal-header">
        <div class="modal-title" style="display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--accent-primary);"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          My Settings & Preferences
        </div>
        <button class="modal-close-btn" id="btn-close-modal">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Settings Content -->
      <div class="modal-body" style="padding: 24px;">
        <!-- Account Info -->
        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 6px;">Your Name / Display Nickname</label>
          <input type="text" id="setting-user-name" style="width: 100%; padding: 10px 14px;" value="${userName}" placeholder="e.g. Alex Morgan" />
          <div class="form-hint" style="margin-top: 4px;">Used on your personal fact-check reports and sidebar profile.</div>
        </div>

        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 6px;">Language</label>
          <select id="setting-user-lang" style="width: 100%; padding: 10px 14px;">
            <option value="en" ${userLang === 'en' ? 'selected' : ''}>English</option>
            <option value="ms" ${userLang === 'ms' ? 'selected' : ''}>Bahasa Melayu (Malaysia)</option>
            <option value="zh" ${userLang === 'zh' ? 'selected' : ''}>中文 (Chinese)</option>
            <option value="ta" ${userLang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 6px;">Preferred Health Authority for Fact-Checking</label>
          <select id="setting-primary-auth" style="width: 100%; padding: 10px 14px;">
            <option value="MOH" ${primaryAuth === 'MOH' ? 'selected' : ''}>Ministry of Health Malaysia (KKM & NPRA) — Recommended for local viral news</option>
            <option value="WHO" ${primaryAuth === 'WHO' ? 'selected' : ''}>World Health Organization (WHO) — Global</option>
            <option value="CDC" ${primaryAuth === 'CDC' ? 'selected' : ''}>Centers for Disease Control (CDC) — Global / US</option>
            <option value="FDA" ${primaryAuth === 'FDA' ? 'selected' : ''}>U.S. FDA — Product & Supplement approvals</option>
          </select>
          <div class="form-hint" style="margin-top: 4px;">We check viral claims against this official registry first.</div>
        </div>

        <!-- Toggles -->
        <div class="setting-toggle-row">
          <div class="setting-toggle-info">
            <div class="setting-toggle-title">Simple Everyday Explanations</div>
            <div class="setting-toggle-desc">Explain why a claim is real or fake in plain, easy-to-understand words instead of heavy medical jargon.</div>
          </div>
          <label class="switch-toggle">
            <input type="checkbox" id="setting-plain-language" ${plainLanguage ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="setting-toggle-row">
          <div class="setting-toggle-info">
            <div class="setting-toggle-title">Viral Fake News Alerts</div>
            <div class="setting-toggle-desc">Show a warning on your dashboard when a fake health trend is spreading rapidly on social media.</div>
          </div>
          <label class="switch-toggle">
            <input type="checkbox" id="setting-alert-viral" ${alertViral ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="setting-toggle-row">
          <div class="setting-toggle-info">
            <div class="setting-toggle-title">Save My Search History</div>
            <div class="setting-toggle-desc">Keep a private list of claims and videos you have checked on this device so you can view them anytime.</div>
          </div>
          <label class="switch-toggle">
            <input type="checkbox" id="setting-auto-save" ${autoSave ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 600;">Clear Saved History</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">Remove all previously verified claims saved on this device.</div>
          </div>
          <button class="filter-btn" id="btn-clear-history-data" style="color: #be123c; border-color: #fecdd3;">
            Clear History
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" id="btn-cancel-modal" style="width: auto; flex: none; padding: 10px 18px;">Cancel</button>
        <button class="btn-primary" id="btn-save-modal" style="width: auto; flex: none; padding: 10px 24px;">Save Preferences</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const close = () => modalEl.remove();

  modalEl.querySelector('#btn-close-modal').addEventListener('click', close);
  modalEl.querySelector('#btn-cancel-modal').addEventListener('click', close);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) close();
  });

  const clearBtn = modalEl.querySelector('#btn-clear-history-data');
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your saved search history?')) {
      localStorage.removeItem('mediproof_history');
      clearBtn.textContent = 'Cleared!';
      setTimeout(() => { clearBtn.textContent = 'Clear History'; }, 1500);
    }
  });

  modalEl.querySelector('#btn-save-modal').addEventListener('click', () => {
    const newName = modalEl.querySelector('#setting-user-name').value.trim() || 'Alex Morgan';
    const newLang = modalEl.querySelector('#setting-user-lang').value;
    const newAuth = modalEl.querySelector('#setting-primary-auth').value;
    const newPlain = modalEl.querySelector('#setting-plain-language').checked;
    const newViral = modalEl.querySelector('#setting-alert-viral').checked;
    const newAuto = modalEl.querySelector('#setting-auto-save').checked;

    localStorage.setItem('mediproof_user_name', newName);
    localStorage.setItem('mediproof_user_role', 'Community Member');
    localStorage.setItem('mediproof_user_lang', newLang);
    localStorage.setItem('mediproof_primary_auth', newAuth);
    localStorage.setItem('mediproof_plain_language', String(newPlain));
    localStorage.setItem('mediproof_alert_viral', String(newViral));
    localStorage.setItem('mediproof_auto_save', String(newAuto));

    // Update sidebar profile live
    const sidebarName = document.querySelector('.profile-name');
    const sidebarRole = document.querySelector('.profile-role');
    if (sidebarName) sidebarName.textContent = newName;
    if (sidebarRole) sidebarRole.textContent = 'Community Member';

    if (onSaveCallback) onSaveCallback();
    close();
  });
}
