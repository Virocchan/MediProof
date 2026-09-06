// Dashboard View: Matches the reference UI aesthetic with stats, active rounds, alerts, and recent verifications

export class DashboardViewComponent {
  constructor(container, onNavigateToVerify, historyData = []) {
    this.container = container;
    this.onNavigateToVerify = onNavigateToVerify;
    this.historyData = historyData;
  }

  updateHistory(history) {
    this.historyData = history;
    if (this.container && this.container.querySelector('.breadcrumb-current')?.textContent?.includes('Online Health Fact-Checker')) {
      this.render();
    }
  }

  render() {
    const recentItems = this.historyData.slice(0, 4);

    this.container.innerHTML = `
      <div class="breadcrumb">
        <a href="#dashboard">MediProof</a>
        <span>/</span>
        <span class="breadcrumb-current">Online Health Fact-Checker</span>
      </div>

      <div class="page-title-row">
        <div>
          <h1 class="page-title">Real vs Fake Health Checker</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
            Check whether health statements, viral TikToks, WhatsApp audios, and online product claims are real or fake.
          </p>
        </div>
        <div class="page-actions-group">
          <button class="filter-btn" id="btn-dashboard-filter">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            All Modalities
          </button>
          <button class="header-cta-btn" id="btn-quick-verify-cta">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            Check a Claim
          </button>
        </div>
      </div>

      <!-- Stats Cards Row (matching the reference "Round 1", "Round 2" cards) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div>
            <div class="stat-meta-row">
              <span class="stat-pill">Social Claims</span>
              <span class="stat-pill">1,482 Posts Checked</span>
              <span class="status-indicator-pill status-completed">• Active</span>
            </div>
            <div class="stat-title">Viral Text & Voice Notes</div>
            <div class="stat-desc">WhatsApp forwards & social media claims verified</div>
          </div>
          <div class="stat-footer">
            <div class="avatar-stack">
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User" />
              <div class="avatar-stack-count">+8</div>
            </div>
            <button class="action-pill-btn" id="btn-open-verify-round1">
              Check Text <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-meta-row">
              <span class="stat-pill">Photos & Videos</span>
              <span class="stat-pill">892 Scanned</span>
              <span class="status-indicator-pill status-in-progress">• In Progress</span>
            </div>
            <div class="stat-title">Product Labels & YouTube</div>
            <div class="stat-desc">Spot fake MOH numbers & viral wellness myths</div>
          </div>
          <div class="stat-footer">
            <div class="avatar-stack">
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="User" />
              <img class="avatar-stack-item" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="User" />
              <div class="avatar-stack-count">+5</div>
            </div>
            <button class="action-pill-btn" id="btn-open-verify-round2">
              Scan Photo <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-meta-row">
              <span class="stat-pill">WHO / MOH Synced</span>
              <span class="stat-pill">98.2% Accuracy</span>
              <span class="status-indicator-pill status-completed">• Verified</span>
            </div>
            <div class="stat-title">Public Protection Index</div>
            <div class="stat-desc">342 dangerous viral hoaxes debunked & stopped</div>
          </div>
          <div class="stat-footer">
            <div style="font-size: 0.78rem; color: var(--sdg3-green); font-weight: 700;">
              ✓ WHO & MOH Guidelines
            </div>
            <button class="action-pill-btn" id="btn-open-workflow-tab">
              How AI Works <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main 2-Column Section -->
      <div class="dashboard-layout">
        <!-- Left Column: Verification Feed & Active Claims -->
        <div>
          <div class="section-header">
            <h2 class="section-title">Latest Medical Fact-Checks</h2>
            <div class="section-actions">
              <button class="filter-btn" id="btn-view-all-history">View All History</button>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${recentItems.map(item => {
              let verdictBadge = 'status-verified-unverified';
              if (item.verdict === 'True') verdictBadge = 'status-verified-true';
              else if (item.verdict === 'False') verdictBadge = 'status-verified-false';
              else if (item.verdict === 'Misleading') verdictBadge = 'status-verified-misleading';

              return `
                <div class="card card-sm" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 16px; min-width: 0;">
                    <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent-primary); flex-shrink: 0;">
                      ${item.modality === 'Text' ? 'TXT' : item.modality === 'YouTube' ? 'YT' : item.modality === 'Voice' ? 'MIC' : 'IMG'}
                    </div>
                    <div style="min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        ${item.claimSnippet}
                      </div>
                      <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 12px;">
                        <span>${item.timestamp}</span>
                        <span>Authority: ${item.authority}</span>
                        <span>Latency: ${item.latency}</span>
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                    <span class="status-indicator-pill ${verdictBadge}">[${item.verdict}]</span>
                    <span style="font-size: 0.8rem; font-weight: 700;">${item.confidence}%</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Quick Action Launch Card -->
          <div class="card" style="margin-top: 24px; background: linear-gradient(135deg, #ffffff 0%, #fafbfd 100%); border-left: 4px solid var(--accent-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Launch Multi-Modal Claim Check</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                  Verify WhatsApp forward audio, YouTube wellness advice, supplement labels, or text statements in seconds.
                </div>
              </div>
              <button class="btn-primary" id="btn-launch-verify-inline" style="flex: 0 0 auto; width: auto;">
                Open Studio
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Alerts & Authorities -->
        <div class="side-panel">
          <div class="side-card">
            <div class="side-card-title">
              <span>Public Health Intelligence</span>
              <span class="status-indicator-pill status-completed">Live</span>
            </div>
            <div class="feed-list">
              <div class="feed-item">
                <div class="feed-icon" style="color: var(--verdict-false);">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </div>
                <div class="feed-content">
                  <div class="feed-text">Fake MAL19920199X Alert</div>
                  <div class="feed-sub">MOH Malaysia issues warning against counterfeit whitening capsules.</div>
                </div>
              </div>

              <div class="feed-item">
                <div class="feed-icon" style="color: var(--verdict-misleading);">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </div>
                <div class="feed-content">
                  <div class="feed-text">Viral WhatsApp Audio Debunked</div>
                  <div class="feed-sub">Lemon salt water claims discredited by WHO epidemiological team.</div>
                </div>
              </div>

              <div class="feed-item">
                <div class="feed-icon" style="color: var(--sdg3-green);">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                </div>
                <div class="feed-content">
                  <div class="feed-text">WHO Global Sodium Policy Sync</div>
                  <div class="feed-sub">Guideline reference thresholds updated in MediProof AI registry.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="side-card">
            <div class="side-card-title">
              <span>Authoritative Source Panel</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">4 Registries</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-light);">
                <div style="font-size: 0.84rem; font-weight: 600;">World Health Organization (WHO)</div>
                <span class="status-indicator-pill status-completed">Active</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-light);">
                <div style="font-size: 0.84rem; font-weight: 600;">Centers for Disease Control (CDC)</div>
                <span class="status-indicator-pill status-completed">Active</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-light);">
                <div style="font-size: 0.84rem; font-weight: 600;">Ministry of Health (MOH NPRA)</div>
                <span class="status-indicator-pill status-completed">Active</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
                <div style="font-size: 0.84rem; font-weight: 600;">U.S. Food & Drug Admin (FDA)</div>
                <span class="status-indicator-pill status-completed">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const ctaBtn = this.container.querySelector('#btn-quick-verify-cta');
    if (ctaBtn) ctaBtn.addEventListener('click', () => this.onNavigateToVerify());

    const inlineBtn = this.container.querySelector('#btn-launch-verify-inline');
    if (inlineBtn) inlineBtn.addEventListener('click', () => this.onNavigateToVerify());

    const round1Btn = this.container.querySelector('#btn-open-verify-round1');
    if (round1Btn) round1Btn.addEventListener('click', () => this.onNavigateToVerify('text'));

    const round2Btn = this.container.querySelector('#btn-open-verify-round2');
    if (round2Btn) round2Btn.addEventListener('click', () => this.onNavigateToVerify('photo'));

    const flowBtn = this.container.querySelector('#btn-open-workflow-tab');
    if (flowBtn) flowBtn.addEventListener('click', () => {
      window.location.hash = '#workflow';
    });

    const viewAllBtn = this.container.querySelector('#btn-view-all-history');
    if (viewAllBtn) viewAllBtn.addEventListener('click', () => {
      window.location.hash = '#history';
    });
  }
}
