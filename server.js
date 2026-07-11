require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Database Connection ───────────────────────────────────────────────────────
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'netflix_clone',
});

db.connect((err) => {
  if (err) {
    console.error('❌  DB Connection failed:', err.message);
    console.warn('⚠️   Server running without database – Login/Register will not work.');
  } else {
    console.log('✅  Connected to MySQL database');
  }
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'netflix_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// ─── Auth Guard ────────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/');
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET / → Login page
app.get('/', (req, res) => {
  const flash = {
    success: req.session.flash_success || null,
    error: req.session.flash_error || null,
  };
  delete req.session.flash_success;
  delete req.session.flash_error;
  res.render('login', { flash });
});

// GET /signup → Signup page
app.get('/signup', (req, res) => {
  const flash = { error: req.session.flash_error || null };
  delete req.session.flash_error;
  res.render('signup', { flash });
});

// POST /login → Authenticate user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.flash_error = 'Please fill in all fields.';
    return res.redirect('/');
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      req.session.flash_error = 'Database error. Please try again.';
      return res.redirect('/');
    }

    if (results.length === 0) {
      req.session.flash_error = 'Invalid email or password.';
      return res.redirect('/');
    }

    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        req.session.flash_error = 'Invalid email or password.';
        return res.redirect('/');
      }
      req.session.user = { id: user.id, fullname: user.fullname, email: user.email };
      res.redirect('/home');
    } catch (e) {
      req.session.flash_error = 'Something went wrong. Please try again.';
      res.redirect('/');
    }
  });
});

// POST /register → Create new user
app.post('/register', async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    req.session.flash_error = 'Please fill in all fields.';
    return res.redirect('/signup');
  }

  if (password.length < 6) {
    req.session.flash_error = 'Password must be at least 6 characters.';
    return res.redirect('/signup');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
      [fullname, email, hashedPassword],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            req.session.flash_error = 'An account with this email already exists.';
          } else {
            req.session.flash_error = 'Registration failed. Please try again.';
          }
          return res.redirect('/signup');
        }
        req.session.flash_success = '🎉 Account created! Please sign in.';
        res.redirect('/');
      }
    );
  } catch (e) {
    req.session.flash_error = 'Something went wrong. Please try again.';
    res.redirect('/signup');
  }
});

// GET /home → Protected home page
app.get('/home', requireAuth, (req, res) => {
  res.render('home', { user: req.session.user });
});

// GET /logout → Destroy session
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎬  Netflix Clone running at → http://localhost:${PORT}\n`);
});
