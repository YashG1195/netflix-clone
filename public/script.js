// ── Auth pages shared JS (login + signup) ─────────────────

// Show/hide password toggle
document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('svg').style.opacity = isPassword ? '0.5' : '1';
  });
});

// Button loading state on form submit
document.querySelectorAll('.auth-form').forEach((form) => {
  form.addEventListener('submit', () => {
    const btn = form.querySelector('.btn-primary');
    if (btn) btn.classList.add('loading');
  });
});

// Password strength meter (signup page only)
const passwordInput = document.getElementById('signupPassword');
const strengthBar   = document.getElementById('strengthBar');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

if (passwordInput && strengthBar) {
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    strengthBar.classList.toggle('visible', val.length > 0);

    let score = 0;
    if (val.length >= 6)                    score++;
    if (val.length >= 10)                   score++;
    if (/[A-Z]/.test(val))                  score++;
    if (/[0-9]/.test(val))                  score++;
    if (/[^A-Za-z0-9]/.test(val))          score++;

    const levels = [
      { pct: 20,  color: '#e50914', label: 'Very weak'  },
      { pct: 40,  color: '#ff6348', label: 'Weak'       },
      { pct: 60,  color: '#ffa502', label: 'Fair'       },
      { pct: 80,  color: '#2ed573', label: 'Strong'     },
      { pct: 100, color: '#1e90ff', label: 'Very strong'},
    ];

    const level = levels[Math.min(score, 4)];
    strengthFill.style.width     = val.length === 0 ? '0%' : level.pct + '%';
    strengthFill.style.background = level.color;
    strengthLabel.textContent    = val.length === 0 ? 'Password strength' : level.label;
    strengthLabel.style.color    = val.length === 0 ? '#8c8c8c' : level.color;
  });
}
