// ── Home page JS ──────────────────────────────────────────

// Navbar: add .scrolled class on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Auto-hide welcome toast after animation
const toast = document.getElementById('welcomeToast');
if (toast) {
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4600);
}

// Play button ripple / scale feedback
const playBtn = document.getElementById('playBtn');
if (playBtn) {
  playBtn.addEventListener('click', () => {
    playBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { playBtn.style.transform = ''; }, 150);
  });
}

// Keyboard: allow card interaction with Enter key
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.contains(e.target)) {
    menu.querySelector('.dropdown').style.opacity = '';
  }
});
