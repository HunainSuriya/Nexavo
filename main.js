// ============================================================
//  Nexavo — main.js (with Database Integration)
// ============================================================

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

/* ── Contact Form Handler with Database ───────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    
    // Get form data - adjust selectors based on your form structure
    const nameInput = form.querySelector('#name, input[name="name"], input[placeholder*="Name"]');
    const emailInput = form.querySelector('#email, input[name="email"], input[placeholder*="Email"]');
    const messageInput = form.querySelector('#message, textarea[name="message"], textarea[placeholder*="Message"]');
    
    const name = nameInput?.value || '';
    const email = emailInput?.value || '';
    const message = messageInput?.value || '';
    
    // Validate
    if (!name || !email || !message) {
      showNotification('Please fill all fields', 'error');
      return;
    }
    
    // Disable button and show loading
    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;
    
    try {
      // Send to backend database
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message })
      });
      
      const data = await response.json();
      
      if (data.success) {
        btn.innerHTML = '✅ Message Sent!';
        btn.style.background = 'linear-gradient(135deg,#4caf50,#2e7d32)';
        form.reset();
        showNotification('Your message has been saved to the database!', 'success');
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
    // Remove existing notification
    const oldNotif = document.querySelector('.nexavo-notification');
    if (oldNotif) oldNotif.remove();
    
    // Create notification element
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
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
})();

/* ── Track Page Visits (Analytics) ───────────────────────── */
(function trackVisits() {
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: window.location.pathname,
      referrer: document.referrer
    })
  }).catch(err => console.error('Analytics error:', err));
})();

/* ── Database User Data Functions (Replaces localStorage) ─── */
(async function initUserData() {
  // Generate or get user ID
  let userId = localStorage.getItem('nexavo_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nexavo_user_id', userId);
  }
  
  // Save data to database (replaces localStorage.setItem)
  window.saveToDatabase = async (key, value) => {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          data_key: key, 
          data_value: typeof value === 'object' ? JSON.stringify(value) : String(value) 
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to save to database:', error);
      return null;
    }
  };
  
  // Load data from database (replaces localStorage.getItem)
  window.loadFromDatabase = async (key) => {
    try {
      const response = await fetch(`/api/get-data/${userId}/${key}`);
      const data = await response.json();
      if (data.data_value) {
        // Try to parse JSON if it looks like JSON
        try {
          return JSON.parse(data.data_value);
        } catch {
          return data.data_value;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load from database:', error);
      return null;
    }
  };
  
  // Example: Load and apply saved theme if exists
  const savedTheme = await window.loadFromDatabase('theme');
  if (savedTheme && savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
})();

/* ── Utility: Save any localStorage data to database ──────── */
// Use this function to migrate your existing localStorage data to database
async function migrateLocalStorageToDatabase() {
  const itemsToMigrate = ['userPreferences', 'cartItems', 'userSettings', 'formData'];
  
  for (const key of itemsToMigrate) {
    const localData = localStorage.getItem(key);
    if (localData) {
      await saveToDatabase(key, localData);
      console.log(`Migrated ${key} to database`);
    }
  }
}

// Uncomment the line below to migrate your existing data
// migrateLocalStorageToDatabase();

/* ── Example: How to use the database functions ───────────── */
/*
// SAVE data to database instead of localStorage:
await saveToDatabase('userTheme', 'dark');
await saveToDatabase('shoppingCart', { items: ['item1', 'item2'], total: 100 });

// LOAD data from database:
const theme = await loadFromDatabase('userTheme');
const cart = await loadFromDatabase('shoppingCart');

// OLD way (localStorage) - replace with above:
localStorage.setItem('key', 'value');     // OLD - DON'T USE
const value = localStorage.getItem('key'); // OLD - DON'T USE
*/