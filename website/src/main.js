// Main Application Entry Point
import { SidebarComponent } from './components/sidebar.js';
import { HeaderComponent } from './components/header.js';
import { DashboardViewComponent } from './components/dashboardView.js';
import { VerifyStudioComponent } from './components/verifyStudio.js';
import { HistoryViewComponent } from './components/historyView.js';
import { WorkflowViewComponent } from './components/workflowView.js';
import { openSettingsModal } from './components/settingsModal.js';
import { INITIAL_VERIFICATION_HISTORY } from './services/sampleData.js';
import { renderVerdictCard, initVerdictCard } from './components/verdictCard.js';

class MediProofApp {
  constructor() {
    this.historyData = [...INITIAL_VERIFICATION_HISTORY];
    this.currentView = 'dashboard';

    this.sidebarContainer = document.getElementById('sidebar-container');
    this.headerContainer = document.getElementById('header-container');
    this.viewContainer = document.getElementById('page-stage');

    this.sidebar = null;
    this.header = null;
    this.dashboardView = null;
    this.verifyStudio = null;
    this.historyView = null;
    this.workflowView = null;
  }

  init() {
    // Initialize components
    this.sidebar = new SidebarComponent(this.sidebarContainer, (route) => this.navigateTo(route));
    this.sidebar.render();

    this.header = new HeaderComponent(
      this.headerContainer,
      () => this.navigateTo('verify'),
      (searchQuery) => this.handleGlobalSearch(searchQuery)
    );
    this.header.render();

    // Listen to settings event
    window.addEventListener('open-settings-modal', () => {
      openSettingsModal(() => {
        this.header.updateEngineStatus();
        if (this.verifyStudio) this.verifyStudio.updateStatusPill();
      });
    });

    // Listen to hash change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigateTo(hash);
    });

    // Handle initial route
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(initialHash);

    // Listen to live n8n callbacks from POST /api/n8n-callback via SSE
    this.listenToN8nStream();
  }

  listenToN8nStream() {
    if (typeof EventSource !== 'undefined') {
      try {
        const eventSource = new EventSource('/api/n8n-stream');
        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);
            this.handleN8nIncomingCallback(data);
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        };
      } catch (err) {
        console.warn('SSE connection skipped:', err);
      }
    }
  }

  handleN8nIncomingCallback(data) {
    // Add to history
    const historyItem = {
      id: data.id,
      timestamp: data.timestamp,
      modality: 'n8n Workflow',
      claimSnippet: data.explanation || data.rawText || 'Incoming verified claim',
      verdict: data.verdict || 'Verified',
      confidence: data.confidence || 98,
      authority: data.sources && data.sources[0] ? data.sources[0].name : 'WHO / MOH',
      latency: data.latency || '0.4s'
    };

    this.historyData.unshift(historyItem);

    // Update views only if that specific view is currently open
    if (this.currentView === 'dashboard' && this.dashboardView) {
      this.dashboardView.updateHistory(this.historyData);
    }
    if (this.currentView === 'history' && this.historyView) {
      this.historyView.updateData(this.historyData);
    }

    // Show on-screen toast alert
    this.showN8nToast(data);

    // If currently on verify page, update the verdict display
    const outputContainer = document.getElementById('verdict-output-container');
    if (outputContainer) {
      outputContainer.innerHTML = renderVerdictCard(data);
      initVerdictCard(outputContainer, data);
      outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  showN8nToast(data) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #17181c;
      color: white;
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      box-shadow: 0 12px 36px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 420px;
      animation: slide-up 0.3s ease;
      border-left: 4px solid ${data.verdict === 'True' ? '#15803d' : data.verdict === 'False' ? '#be123c' : '#d97706'};
    `;

    toast.innerHTML = `
      <div style="font-size: 1.2rem;">⚡</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 0.78rem; color: #a1a1aa; font-weight: 600; text-transform: uppercase;">
          New n8n Callback Received
        </div>
        <div style="font-weight: 700; font-size: 0.92rem; margin: 2px 0;">
          [${data.verdict}]: ${data.explanation ? data.explanation.substring(0, 75) + '...' : 'Fact-check completed'}
        </div>
        <div style="font-size: 0.72rem; color: #71717a;">Checked via n8n • ${data.id}</div>
      </div>
      <button style="color: #71717a; padding: 4px; font-size: 1.1rem; line-height: 1;">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => toast.remove());

    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
  }

  navigateTo(route, optionalModality = null) {
    this.currentView = route;
    if (this.sidebar) this.sidebar.setActive(route);

    if (window.location.hash !== `#${route}`) {
      window.location.hash = `#${route}`;
    }

    this.renderCurrentView(optionalModality);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView(optionalModality) {
    this.viewContainer.innerHTML = '';

    if (this.currentView === 'dashboard') {
      this.dashboardView = new DashboardViewComponent(
        this.viewContainer,
        (modality) => this.navigateTo('verify', modality),
        this.historyData
      );
      this.dashboardView.render();
    } else if (this.currentView === 'verify') {
      this.verifyStudio = new VerifyStudioComponent(this.viewContainer, (newResult) => {
        this.handleClaimVerified(newResult);
      });
      if (optionalModality) {
        this.verifyStudio.activeModality = optionalModality;
      }
      this.verifyStudio.render();
    } else if (this.currentView === 'history') {
      this.historyView = new HistoryViewComponent(this.viewContainer, this.historyData);
      this.historyView.render();
    } else if (this.currentView === 'workflow') {
      this.workflowView = new WorkflowViewComponent(this.viewContainer, () => {
        this.header.updateEngineStatus();
      });
      this.workflowView.render();
    }
  }

  handleClaimVerified(result) {
    const historyItem = {
      id: result.id,
      timestamp: result.timestamp,
      modality: result.modality.charAt(0).toUpperCase() + result.modality.slice(1),
      claimSnippet: result.inputData.text || result.inputData.url || result.inputData.caption || 'Verified health asset',
      verdict: result.verdict,
      confidence: result.confidence,
      authority: result.sources && result.sources[0] ? result.sources[0].name : 'WHO / CDC',
      latency: result.latency
    };

    this.historyData.unshift(historyItem);

    if (this.currentView === 'dashboard' && this.dashboardView) {
      this.dashboardView.updateHistory(this.historyData);
    }
    if (this.currentView === 'history' && this.historyView) {
      this.historyView.updateData(this.historyData);
    }
  }

  handleGlobalSearch(query) {
    this.navigateTo('history');
    setTimeout(() => {
      if (this.historyView) {
        this.historyView.searchQuery = query;
        this.historyView.render();
      }
    }, 50);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new MediProofApp();
  app.init();
});
