// ============================================================
//  Nexavo — main.js (with Cross-Device Sync)
// ============================================================

/* ── Check Login Status ───────────────────────────────────── */
let currentUser = null;

async function checkLogin() {
    const userStr = localStorage.getItem('nexavo_user');
    if (!userStr) {
        // Not logged in, redirect to login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        const data = await response.json();
        if (!data.success) {
            // Session expired
            logout();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth error:', error);
        return false;
    }
}

function logout() {
    localStorage.removeItem('nexavo_user');
    localStorage.removeItem('nexavo_logged_in');
    window.location.href = '/login.html';
}

/* ── Particles Canvas ──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 5;
      this.r  = Math.random() * 1.2 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.a  = Math.random() * 0.35 + 0.08;
    }
    update() { this.x += this.vx; this.y += this.vy; if (this.y < -5) this.reset(false); }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

/* ── Navbar Scroll Effect ──────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  const burger = document.getElementById('hamburger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
    const close = menu.querySelector('.close-menu');
    if (close) close.addEventListener('click', () => menu.classList.remove('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
  
  // Add logout button to nav if logged in
  if (currentUser) {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('logout-btn')) {
      const logoutLi = document.createElement('li');
      const logoutBtn = document.createElement('a');
      logoutBtn.href = '#';
      logoutBtn.textContent = 'Logout';
      logoutBtn.id = 'logout-btn';
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        logout();
      };
      logoutLi.appendChild(logoutBtn);
      navLinks.appendChild(logoutLi);
    }
  }
})();

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── Counter Animations ────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = Math.ceil(target / 60);
      const timer  = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* ── Loading Screen ────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loading');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s';
      setTimeout(() => loader.style.display = 'none', 500);
    }, 1800);
  });
})();

/* ── Contact Form Handler with User ID ────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    
    const nameInput = form.querySelector('#name, input[name="name"], input[placeholder*="Name"]');
    const emailInput = form.querySelector('#email, input[name="email"], input[placeholder*="Email"]');
    const messageInput = form.querySelector('#message, textarea[name="message"], textarea[placeholder*="Message"]');
    
    const name = nameInput?.value || '';
    const email = emailInput?.value || '';
    const message = messageInput?.value || '';
    
    if (!name || !email || !message) {
      showNotification('Please fill all fields', 'error');
      return;
    }
    
    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          message,
          userId: currentUser?.id 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        btn.innerHTML = '✅ Message Sent!';
        btn.style.background = 'linear-gradient(135deg,#4caf50,#2e7d32)';
        form.reset();
        showNotification('Your message has been saved!', 'success');
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Error:', error);
      btn.innerHTML = '❌ Failed! Try Again';
      btn.style.background = 'linear-gradient(135deg,#ff4757,#c0392b)';
      showNotification('Failed to send message. Please try again.', 'error');
    }
    
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });
  
  function showNotification(message, type) {
    const oldNotif = document.querySelector('.nexavo-notification');
    if (oldNotif) oldNotif.remove();
    
    const notification = document.createElement('div');
    notification.className = 'nexavo-notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.zIndex = '10000';
    notification.style.fontWeight = 'bold';
    notification.style.fontFamily = 'system-ui, sans-serif';
    notification.style.background = type === 'success' 
      ? 'linear-gradient(135deg,#4caf50,#2e7d32)'
      : 'linear-gradient(135deg,#ff4757,#c0392b)';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
})();

/* ── Cross-Device Data Sync Functions ─────────────────────── */
async function syncDataToCloud(key, value) {
  if (!currentUser) return;
  
  try {
    await fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: currentUser.id, 
        data_key: key, 
        data_value: typeof value === 'object' ? JSON.stringify(value) : String(value) 
      })
    });
  } catch (error) {
    console.error('Failed to sync to cloud:', error);
  }
}

async function loadDataFromCloud(key) {
  if (!currentUser) return null;
  
  try {
    const response = await fetch(`/api/get-data/${currentUser.id}/${key}`);
    const data = await response.json();
    if (data.data_value) {
      try {
        return JSON.parse(data.data_value);
      } catch {
        return data.data_value;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to load from cloud:', error);
    return null;
  }
}

async function syncAllData() {
  if (!currentUser) return;
  
  try {
    const response = await fetch(`/api/get-all-data/${currentUser.id}`);
    const cloudData = await response.json();
    
    // Apply all cloud data to localStorage
    for (const [key, value] of Object.entries(cloudData)) {
      localStorage.setItem(key, value);
    }
    
    console.log('✅ Synced all data from cloud');
  } catch (error) {
    console.error('Failed to sync all data:', error);
  }
}

// Replace localStorage.setItem with this
window.setItemSync = async (key, value) => {
  localStorage.setItem(key, value);
  await syncDataToCloud(key, value);
};

// Replace localStorage.getItem with this (but also checks cloud)
window.getItemSync = async (key) => {
  // First check localStorage
  let value = localStorage.getItem(key);
  if (value !== null) return value;
  
  // If not in localStorage, check cloud
  value = await loadDataFromCloud(key);
  if (value !== null) {
    localStorage.setItem(key, value);
  }
  return value;
};

/* ── Initialize App and Sync Data ─────────────────────────── */
(async function initApp() {
  // Check login first
  const loggedIn = await checkLogin();
  if (!loggedIn) return;
  
  // Sync all cloud data to local
  await syncAllData();
  
  // Track page visit
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: window.location.pathname,
      referrer: document.referrer,
      userId: currentUser?.id
    })
  }).catch(err => console.error('Analytics error:', err));
  
  // Display welcome message
  if (currentUser) {
    console.log(`Welcome back, ${currentUser.username}!`);
    // You can add a welcome message on the page
    const welcomeEl = document.createElement('div');
    welcomeEl.textContent = `Welcome, ${currentUser.username}! ✨`;
    welcomeEl.style.position = 'fixed';
    welcomeEl.style.top = '80px';
    welcomeEl.style.right = '20px';
    welcomeEl.style.background = 'rgba(0,0,0,0.8)';
    welcomeEl.style.color = '#c9a84c';
    welcomeEl.style.padding = '8px 16px';
    welcomeEl.style.borderRadius = '20px';
    welcomeEl.style.fontSize = '12px';
    welcomeEl.style.zIndex = '9999';
    document.body.appendChild(welcomeEl);
    
    setTimeout(() => {
      welcomeEl.style.opacity = '0';
      setTimeout(() => welcomeEl.remove(), 1000);
    }, 3000);
  }
})();

/* ── Usage Examples ────────────────────────────────────────── */
/*
// SAVE data (syncs across all devices automatically):
await setItemSync('userTheme', 'dark');
await setItemSync('cartItems', JSON.stringify(['item1', 'item2']));

// LOAD data:
const theme = await getItemSync('userTheme');
const cart = await getItemSync('cartItems');

// Now when you login on any device, your data will be there!
*/