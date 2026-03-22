// ═══════════════════════════════════════════════
// CAMPUSGARH — AUTH & UTILITIES
// ═══════════════════════════════════════════════

// ── Auth (localStorage-backed) ──────────────────
const CG_AUTH = {
  users: JSON.parse(localStorage.getItem('cg_users') || '[]'),
  
  saveUsers() {
    localStorage.setItem('cg_users', JSON.stringify(this.users));
  },
  
  currentUser() {
    const uid = localStorage.getItem('cg_current');
    if (!uid) return null;
    return this.users.find(u => u.id === uid) || null;
  },
  
  isLoggedIn() {
    return !!this.currentUser();
  },
  
  register({ fullname, username, email, password }) {
    if (this.users.find(u => u.email === email)) {
      return { ok: false, msg: 'Email already registered.' };
    }
    if (this.users.find(u => u.username === username)) {
      return { ok: false, msg: 'Username taken.' };
    }
    const user = {
      id: 'u_' + Date.now(),
      fullname, username, email, password,
      createdAt: new Date().toISOString(),
      enquiries: [], savedColleges: [], reviewIds: []
    };
    this.users.push(user);
    this.saveUsers();
    localStorage.setItem('cg_current', user.id);
    return { ok: true, user };
  },
  
  login({ email, password }) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    localStorage.setItem('cg_current', user.id);
    return { ok: true, user };
  },
  
  logout() {
    localStorage.removeItem('cg_current');
    window.location.href = 'index.html';
  },
  
  saveCollege(collegeId) {
    const user = this.currentUser();
    if (!user) return false;
    const idx = this.users.findIndex(u => u.id === user.id);
    if (!this.users[idx].savedColleges.includes(collegeId)) {
      this.users[idx].savedColleges.push(collegeId);
      this.saveUsers();
    }
    return true;
  },
  
  unsaveCollege(collegeId) {
    const user = this.currentUser();
    if (!user) return false;
    const idx = this.users.findIndex(u => u.id === user.id);
    this.users[idx].savedColleges = this.users[idx].savedColleges.filter(id => id !== collegeId);
    this.saveUsers();
    return true;
  },
  
  isSaved(collegeId) {
    const user = this.currentUser();
    return user ? (user.savedColleges || []).includes(collegeId) : false;
  },
  
  addEnquiry(enquiry) {
    const user = this.currentUser();
    if (!user) return false;
    const idx = this.users.findIndex(u => u.id === user.id);
    enquiry.id = 'eq_' + Date.now();
    enquiry.date = new Date().toISOString();
    enquiry.status = 'Pending';
    this.users[idx].enquiries = this.users[idx].enquiries || [];
    this.users[idx].enquiries.push(enquiry);
    this.saveUsers();
    return true;
  },
  
  addReview(review) {
    const user = this.currentUser();
    if (!user) return null;
    review.id = 'rv_' + Date.now();
    review.author = user.fullname;
    review.avatar = user.fullname.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    review.date = 'Just now';
    const stored = JSON.parse(localStorage.getItem('cg_reviews') || '[]');
    stored.push(review);
    localStorage.setItem('cg_reviews', JSON.stringify(stored));
    return review;
  },
  
  getReviews(collegeId) {
    const stored = JSON.parse(localStorage.getItem('cg_reviews') || '[]');
    const base = CG_DATA.reviews.filter(r => r.collegeId === collegeId);
    const userReviews = stored.filter(r => r.collegeId === collegeId);
    return [...userReviews, ...base];
  }
};

// ── Toast Notifications ──────────────────────────
function showToast(msg, type = 'default') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { default: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||icons.default}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── URL Params ───────────────────────────────────
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ── Render Nav Auth Buttons ──────────────────────
function renderNav() {
  const user = CG_AUTH.currentUser();
  const container = document.querySelector('.nav-cta');
  if (!container) return;
  if (user) {
    container.innerHTML = `
      <a href="profile.html" class="btn-ghost">👤 ${user.fullname.split(' ')[0]}</a>
      <button class="btn-gold" onclick="CG_AUTH.logout()">Logout</button>
    `;
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn-ghost">Login</a>
      <a href="register.html" class="btn-gold">Get Started ✦</a>
    `;
  }
}

// ── Smooth Page Transition ───────────────────────
function navigateTo(url) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s';
  setTimeout(() => window.location.href = url, 300);
}

// ── Cursor ───────────────────────────────────────
function initCursor() {
  if (window.innerWidth < 768) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a, button, .college-card, .course-card, .exam-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

// ── Scroll Reveal ────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
    observer.observe(el);
  });
}

// ── Counter Animation ────────────────────────────
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start = Date.now();
  const startVal = 0;
  function step() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(startVal + (target - startVal) * ease);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  step();
}

// ── Header scroll effect ─────────────────────────
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ── Hamburger Menu ───────────────────────────────
function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => mobileNav.classList.add('open'));
  const closeBtn = mobileNav.querySelector('.mobile-nav-close');
  if (closeBtn) closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
}

// ── Init all on load ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  initCursor();
  initScrollReveal();
  initHeader();
  initMobileNav();
});