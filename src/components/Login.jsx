import React, { useState } from 'react';
import { Store, Eye, EyeOff, Lock, User, Coffee } from 'lucide-react';

// ── Hardcoded credentials (stored in localStorage for persistence) ──
const USERS = [
  { username: 'owner', password: 'owner123', role: 'owner', label: 'Owner', color: '#a78bfa' },
  { username: 'cashier', password: 'cash123', role: 'cashier', label: 'Cashier', color: '#34d399' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const match = USERS.find(
        (u) => u.username === username.trim().toLowerCase() && u.password === password
      );
      if (match) {
        localStorage.setItem('growth_copilot_session', JSON.stringify({ role: match.role, label: match.label }));
        onLogin(match);
      } else {
        setError('Incorrect username or password. Please try again.');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div style={styles.root}>
      {/* Animated background blobs */}
      <div style={{ ...styles.blob, top: '-120px', left: '-80px', background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)' }} />
      <div style={{ ...styles.blob, bottom: '-100px', right: '-60px', background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)' }} />
      <div style={{ ...styles.blob, top: '40%', left: '60%', background: 'radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 70%)' }} />

      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brandRow}>
          <div style={styles.iconCircle}>
            <Coffee size={28} color="#a78bfa" />
          </div>
          <div>
            <div style={styles.brandTitle}>Business Growth Co-Pilot</div>
            <div style={styles.brandSub}>Smart Analytics for Your Coffee Shop</div>
          </div>
        </div>

        <h2 style={styles.heading}>Welcome Back 👋</h2>
        <p style={styles.subText}>Sign in to access your dashboard</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={16} style={styles.inputIcon} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span style={styles.spinner} /> Signing in...
              </span>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        {/* Role hint cards */}
        <div style={styles.hintSection}>
          <p style={styles.hintTitle}>Demo Credentials</p>
          <div style={styles.hintRow}>
            {USERS.map((u) => (
              <button
                key={u.role}
                type="button"
                id={`quick-login-${u.role}`}
                onClick={() => { setUsername(u.username); setPassword(u.password); }}
                style={{ ...styles.hintCard, borderColor: u.color + '55' }}
              >
                <span style={{ color: u.color, fontWeight: 700, fontSize: '0.85rem' }}>{u.label}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{u.username} / {u.password}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={styles.footer}>
          <Lock size={12} style={{ marginRight: '4px' }} />
          Secured · Data stored locally in your browser
        </p>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(167,139,250,0.45);
        }
        #login-submit-btn {
          transition: transform 0.2s, box-shadow 0.2s;
        }
      `}</style>
    </div>
  );
}

// ── Inline styles (matches dark glassmorphism theme) ──
const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b2a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: "'Inter', 'Outfit', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    animation: 'blobPulse 7s ease-in-out infinite',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.045)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    animation: 'loginFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
    position: 'relative',
    zIndex: 2,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    marginBottom: '1.8rem',
  },
  iconCircle: {
    background: 'rgba(167,139,250,0.15)',
    border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: '14px',
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f1f5f9',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: '0 0 0.3rem 0',
  },
  subText: {
    fontSize: '0.87rem',
    color: '#94a3b8',
    margin: '0 0 1.75rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#cbd5e1',
    letterSpacing: '0.02em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.85rem',
    color: '#64748b',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '0.92rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.85rem',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    color: '#fca5a5',
    fontSize: '0.82rem',
  },
  loginBtn: {
    marginTop: '0.4rem',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  hintSection: {
    marginTop: '1.6rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '1.2rem',
  },
  hintTitle: {
    fontSize: '0.72rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.7rem',
    textAlign: 'center',
  },
  hintRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  hintCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: '12px',
    padding: '0.65rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.72rem',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
