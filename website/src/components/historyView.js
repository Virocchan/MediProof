// History & Audit Log View: Filter, search, and inspect past verifications

export class HistoryViewComponent {
  constructor(container, historyData = []) {
    this.container = container;
    this.historyData = historyData;
    this.searchQuery = '';
    this.filterModality = 'all';
    this.filterVerdict = 'all';
  }

  updateData(data) {
    this.historyData = data;
    if (this.container && this.container.querySelector('.breadcrumb-current')?.textContent?.includes('Audit History')) {
      this.render();
    }
  }

  render() {
    const filtered = this.getFilteredData();

    this.container.innerHTML = `
      <div class="breadcrumb">
        <a href="#dashboard">MediProof</a>
        <span>/</span>
        <span class="breadcrumb-current">Verification Audit History</span>
      </div>

      <div class="page-title-row">
        <div>
          <h1 class="page-title">Claim Audit Trail</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
            Complete chronological record of all medical statements, transcripts, and media verified.
          </p>
        </div>
        <div class="page-actions-group">
          <button class="filter-btn" id="btn-export-history-json">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export JSON
          </button>
          <button class="filter-btn" id="btn-print-report">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Dossier
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card card-sm" style="margin-bottom: 20px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div class="header-search-bar" style="flex: 1; min-width: 260px;">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" id="history-search-input" placeholder="Search claims, active ingredients, or authorities..." value="${this.searchQuery}" />
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <select id="filter-modality-select" style="padding: 8px 12px; font-size: 0.85rem; border-radius: var(--radius-full);">
            <option value="all" ${this.filterModality === 'all' ? 'selected' : ''}>All Modalities</option>
            <option value="Text" ${this.filterModality === 'Text' ? 'selected' : ''}>Text & Social</option>
            <option value="YouTube" ${this.filterModality === 'YouTube' ? 'selected' : ''}>YouTube Videos</option>
            <option value="Voice" ${this.filterModality === 'Voice' ? 'selected' : ''}>Voice Notes</option>
            <option value="Photo" ${this.filterModality === 'Photo' ? 'selected' : ''}>Product Photos</option>
          </select>

          <select id="filter-verdict-select" style="padding: 8px 12px; font-size: 0.85rem; border-radius: var(--radius-full);">
            <option value="all" ${this.filterVerdict === 'all' ? 'selected' : ''}>All Verdicts</option>
            <option value="True" ${this.filterVerdict === 'True' ? 'selected' : ''}>True Only</option>
            <option value="False" ${this.filterVerdict === 'False' ? 'selected' : ''}>False Only</option>
            <option value="Misleading" ${this.filterVerdict === 'Misleading' ? 'selected' : ''}>Misleading Only</option>
          </select>
        </div>
      </div>

      <!-- History Table -->
      <div class="history-table-wrapper">
        <table class="history-table">
          <thead>
            <tr>
              <th>ID & Timestamp</th>
              <th>Modality</th>
              <th>Claim / Statement</th>
              <th>Verdict</th>
              <th>Consensus</th>
              <th>Authority</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  No verification records found matching your filters.
                </td>
              </tr>
            ` : filtered.map(item => {
              let verdictBadge = 'status-verified-unverified';
              if (item.verdict === 'True') verdictBadge = 'status-verified-true';
              else if (item.verdict === 'False') verdictBadge = 'status-verified-false';
              else if (item.verdict === 'Misleading') verdictBadge = 'status-verified-misleading';

              return `
                <tr>
                  <td>
                    <div style="font-weight: 700; font-family: var(--font-mono); font-size: 0.8rem;">${item.id}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${item.timestamp}</div>
                  </td>
                  <td>
                    <span class="stat-pill" style="font-weight: 600;">${item.modality}</span>
                  </td>
                  <td style="max-width: 380px;">
                    <div style="font-weight: 600; font-size: 0.88rem; line-height: 1.4;">${item.claimSnippet}</div>
                  </td>
                  <td>
                    <span class="status-indicator-pill ${verdictBadge}">[${item.verdict}]</span>
                  </td>
                  <td>
                    <div style="font-weight: 700;">${item.confidence}%</div>
                  </td>
                  <td>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">${item.authority}</span>
                  </td>
                  <td>
                    <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">${item.latency}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachEvents();
  }

  getFilteredData() {
    return this.historyData.filter(item => {
      const matchesSearch = !this.searchQuery || 
        item.claimSnippet.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.authority.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesModality = this.filterModality === 'all' || 
        item.modality.toLowerCase() === this.filterModality.toLowerCase();

      const matchesVerdict = this.filterVerdict === 'all' || 
        item.verdict.toLowerCase() === this.filterVerdict.toLowerCase();

      return matchesSearch && matchesModality && matchesVerdict;
    });
  }

  attachEvents() {
    const searchInput = this.container.querySelector('#history-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    const modSelect = this.container.querySelector('#filter-modality-select');
    if (modSelect) {
      modSelect.addEventListener('change', (e) => {
        this.filterModality = e.target.value;
        this.render();
      });
    }

    const verdictSelect = this.container.querySelector('#filter-verdict-select');
    if (verdictSelect) {
      verdictSelect.addEventListener('change', (e) => {
        this.filterVerdict = e.target.value;
        this.render();
      });
    }

    const exportBtn = this.container.querySelector('#btn-export-history-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.historyData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mediproof_audit_trail_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    const printBtn = this.container.querySelector('#btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  }
}
