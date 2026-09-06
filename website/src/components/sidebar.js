// Sidebar Component matching the reference UI layout for everyday public health fact-checking

export class SidebarComponent {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.activeRoute = 'dashboard';
  }

  setActive(route) {
    this.activeRoute = route;
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      const target = link.getAttribute('data-route');
      if (target === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  render() {
    const currentName = localStorage.getItem('mediproof_user_name') || 'Alex Morgan';
    const currentRole = localStorage.getItem('mediproof_user_role') || 'Community Member';

    this.container.innerHTML = `
      <aside class="sidebar">
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="brand-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div class="brand-info">
            <div class="brand-title">
              MediProof
              <span class="brand-sdg-tag">SDG 3</span>
            </div>
            <div class="brand-subtitle">Online Health Fact-Checker</div>
          </div>
        </div>

        <!-- Navigation Group -->
        <div class="nav-group">
          <div class="nav-heading">Fact-Check Hub</div>
          
          <a href="#dashboard" class="nav-link ${this.activeRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>Overview</span>
          </a>

          <a href="#verify" class="nav-link ${this.activeRoute === 'verify' ? 'active' : ''}" data-route="verify">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <span>Check a Claim</span>
            <span class="nav-badge">4 Ways</span>
          </a>

          <a href="#history" class="nav-link ${this.activeRoute === 'history' ? 'active' : ''}" data-route="history">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>My Fact-Checks</span>
            <span class="nav-badge">Saved</span>
          </a>

          <a href="#workflow" class="nav-link ${this.activeRoute === 'workflow' ? 'active' : ''}" data-route="workflow">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>How AI Verifies</span>
            <span class="nav-badge" style="background: rgba(45,157,104,0.15); color: var(--sdg3-green);">n8n Flow</span>
          </a>
        </div>

        <!-- Online Claim Categories -->
        <div class="nav-group">
          <div class="nav-heading">Trending Topics</div>
          <div class="category-item">
            <span class="category-dot dot-blue"></span>
            <span>TikTok & Reels Advice</span>
          </div>
          <div class="category-item">
            <span class="category-dot dot-orange"></span>
            <span>WhatsApp Home Remedies</span>
          </div>
          <div class="category-item">
            <span class="category-dot dot-emerald"></span>
            <span>Diet & Weight Loss Myths</span>
          </div>
          <div class="category-item">
            <span class="category-dot dot-purple"></span>
            <span>Online Miracle Supplements</span>
          </div>
        </div>

        <!-- Community Free Protection Card -->
        <div class="sidebar-pro-card">
          <div class="pro-card-decor"></div>
          <div class="pro-card-title">
            <span>Free Public Access</span>
            <span class="pro-pill">FREE</span>
          </div>
          <div class="pro-card-desc">
            Instantly check online posts, viral videos, voice notes, and product labels against WHO & MOH guidelines.
          </div>
          <button class="pro-card-btn" id="btn-sidebar-pro-settings">
            <span>My Preferences</span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <!-- User Profile Bar at bottom -->
        <div class="sidebar-profile">
          <img class="profile-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" alt="Profile" />
          <div class="profile-info">
            <div class="profile-name">${currentName}</div>
            <div class="profile-role">${currentRole}</div>
          </div>
          <button class="profile-action-btn" id="btn-profile-settings" title="My Preferences">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </aside>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.setActive(route);
        if (this.onNavigate) this.onNavigate(route);
      });
    });

    const proBtn = this.container.querySelector('#btn-sidebar-pro-settings');
    if (proBtn) {
      proBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-settings-modal'));
      });
    }

    const settingsBtn = this.container.querySelector('#btn-profile-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-settings-modal'));
      });
    }
  }
}
