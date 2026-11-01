import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Bot,
  Package,
  Camera,
  Megaphone,
  Bell,
  Settings,
  Globe,
  Store,
  Receipt,
  ClipboardList,
  Loader2,
  Database,
  UtensilsCrossed
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProfitLoss from './components/ProfitLoss';
import Chatbot from './components/Chatbot';
import Inventory from './components/Inventory';
import Expenses from './components/Expenses';
import Marketing from './components/Marketing';
import Insights from './components/Insights';
import { translations } from './utils/translations';
import Login from './components/Login';
import Billing from './components/Billing';
import Orders from './components/Orders';
import MenuManager from './components/MenuManager';

// Firebase services
import {
  listenSales,
  listenInventory,
  listenOrders,
  listenExpenses,
  addOrder,
  addSale,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addExpense,
  deleteExpense,
  deleteOrder,
  checkIfSeeded,
  seedDatabase,
} from './utils/db';import { SEED_DATA } from './utils/seedData';

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('growth_copilot_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => {
    localStorage.removeItem('growth_copilot_session');
    setCurrentUser(null);
  };

  // ── Settings (still local — no need for Firestore) ─────────────
  const [lang, setLang] = useState(() => localStorage.getItem('growth_copilot_lang') || 'en');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('growth_copilot_gemini_key') || '');
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('growth_copilot_biz_name') || 'Brewtopia Cafe');
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempBizName, setTempBizName] = useState(businessName);

  // ── Firestore live state ────────────────────────────────────────
  const [sales, setSales]         = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders]       = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [seeding, setSeeding]     = useState(false);

  // Derived "database" object so existing child components receive the same shape
  const database = { sales, inventory, orders, expenses };

  // ── Seed once if Firestore is empty ───────────────────────────
  useEffect(() => {
    const initDb = async () => {
      try {
        const alreadySeeded = await checkIfSeeded();
        if (!alreadySeeded) {
          setSeeding(true);
          await seedDatabase(SEED_DATA);
          setSeeding(false);
        }
      } catch (err) {
        console.error('Seed error:', err);
        setSeeding(false);
      }
    };
    initDb();
  }, []);

  // ── Real-time Firestore listeners ──────────────────────────────
  useEffect(() => {
    setDbLoading(true);
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 4) setDbLoading(false); };

    const unsubSales     = listenSales((data)     => { setSales(data);     done(); });
    const unsubInventory = listenInventory((data) => { setInventory(data); done(); });
    const unsubOrders    = listenOrders((data)    => { setOrders(data);    done(); });
    const unsubExpenses  = listenExpenses((data)  => { setExpenses(data);  done(); });

    return () => {
      unsubSales();
      unsubInventory();
      unsubOrders();
      unsubExpenses();
    };
  }, []);

  // ── setDatabase shim — child components call setDatabase(fn)
  //    We intercept writes and route them to Firestore instead ─────
  const setDatabase = async (updaterFn) => {
    // updaterFn receives previous database and returns a new object.
    // We diff sales / inventory / orders / expenses and write only changes.
    const prev = { sales, inventory, orders, expenses };
    const next = updaterFn(prev);

    // ── New SALES ──
    if (next.sales && next.sales.length > prev.sales.length) {
      const newSales = next.sales.filter(
        (s) => !prev.sales.some((p) => p.id === s.id || p.firestoreId === s.firestoreId)
      );
      for (const s of newSales) await addSale(s);
    }

    // ── New ORDERS ──
    if (next.orders && next.orders.length > prev.orders.length) {
      const newOrders = next.orders.filter(
        (o) => !prev.orders.some((p) => p.id === o.id || p.firestoreId === o.firestoreId)
      );
      for (const o of newOrders) await addOrder(o);
    }

    // ── INVENTORY changes (add / update) ──
    if (next.inventory) {
      for (const ni of next.inventory) {
        const existing = prev.inventory.find((pi) => pi.id === ni.id || pi.firestoreId === ni.firestoreId);
        if (!existing) {
          await addInventoryItem(ni);
        } else if (existing.firestoreId && JSON.stringify(existing) !== JSON.stringify(ni)) {
          const { firestoreId, ...data } = ni;
          await updateInventoryItem(existing.firestoreId, data);
        }
      }
      // Detect deleted inventory items
      for (const pi of prev.inventory) {
        if (pi.firestoreId && !next.inventory.some((ni) => ni.firestoreId === pi.firestoreId || ni.id === pi.id)) {
          await deleteInventoryItem(pi.firestoreId);
        }
      }
    }

    // ── EXPENSES changes (add / delete) ──
    if (next.expenses) {
      for (const ne of next.expenses) {
        const existing = prev.expenses.find((pe) => pe.id === ne.id || pe.firestoreId === ne.firestoreId);
        if (!existing) await addExpense(ne);
      }
      for (const pe of prev.expenses) {
        if (pe.firestoreId && !next.expenses.some((ne) => ne.firestoreId === pe.firestoreId || ne.id === pe.id)) {
          await deleteExpense(pe.firestoreId);
        }
      }
    }

    // ── ORDERS deleted ──
    if (next.orders) {
      for (const po of prev.orders) {
        if (po.firestoreId && !next.orders.some((no) => no.firestoreId === po.firestoreId || no.id === po.id)) {
          await deleteOrder(po.firestoreId);
        }
      }
    }
  };

  // ── Show login screen BEFORE any conditional return ───────────
  if (!currentUser) return <Login onLogin={handleLogin} />;

  // ── Loading / Seeding screen ───────────────────────────────────
  if (dbLoading || seeding) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#0f172a,#1e1b4b)',
        color: '#f1f5f9', gap: '1.25rem', fontFamily: "'Inter','Outfit',sans-serif"
      }}>
        <Database size={42} color="#a78bfa" />
        <Loader2 size={28} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
          {seeding ? '⏳ Uploading dataset to Firebase...' : '🔄 Connecting to Firebase database...'}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
          Project: smbs-d661e • Firestore
        </p>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ── Translate helper ───────────────────────────────────────────
  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  // ── Settings handler ───────────────────────────────────────────
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setApiKey(tempKey);
    setBusinessName(tempBizName);
    localStorage.setItem('growth_copilot_gemini_key', tempKey);
    localStorage.setItem('growth_copilot_biz_name', tempBizName);
    setShowSettings(false);
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('growth_copilot_lang', newLang);
  };

  // ── Nav ────────────────────────────────────────────────────────
  const allNavItems = [
    { id: 'dashboard',  label: t('dashboard'),   icon: LayoutDashboard, roles: ['owner', 'cashier'] },
    { id: 'profitLoss', label: t('profitLoss'),   icon: FileSpreadsheet, roles: ['owner'] },
    { id: 'chatbot',    label: t('chatbot'),       icon: Bot,             roles: ['owner'] },
    { id: 'inventory',  label: t('inventory'),     icon: Package,         roles: ['owner', 'cashier'] },
    { id: 'billing',    label: 'Billing / POS',    icon: Receipt,         roles: ['cashier'] },
    { id: 'orders',     label: 'Orders & Bills',   icon: ClipboardList,    roles: ['owner'] },
    { id: 'menu',       label: 'Menu Manager',     icon: UtensilsCrossed,  roles: ['owner'] },
    { id: 'expenses',   label: t('expenses'),      icon: Camera,          roles: ['owner'] },
    { id: 'marketing',  label: t('marketing'),     icon: Megaphone,       roles: ['owner'] },
    { id: 'insights',   label: t('insights'),      icon: Bell,            roles: ['owner'] },
  ];
  const navItems = allNavItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <div className="app-container">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">
          <Store className="brand-icon" size={26} />
          <span>{businessName}</span>
        </div>

        {/* Firebase badge */}
        <div style={{
          margin: '0 0.75rem 0.5rem', padding: '0.3rem 0.75rem',
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <Database size={11} color="#fbbf24" />
          <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 600 }}>
            Firebase Live • {sales.length} sales
          </span>
        </div>

        {/* Role Badge */}
        <div style={{
          margin: '0 0.75rem 0.75rem', padding: '0.4rem 0.75rem',
          background: currentUser.role === 'owner' ? 'rgba(167,139,250,0.15)' : 'rgba(52,211,153,0.15)',
          border: `1px solid ${currentUser.role === 'owner' ? 'rgba(167,139,250,0.3)' : 'rgba(52,211,153,0.3)'}`,
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentUser.role === 'owner' ? '#a78bfa' : '#34d399' }}>
            👤 {currentUser.label}
          </span>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', padding: '2px 4px' }}
            title="Logout"
          >
            ⏻ Logout
          </button>
        </div>

        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ul className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <div
                    className={`nav-item ${selectedTab === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedTab(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Language & Settings */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
              <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, outline: 'none', cursor: 'pointer', width: '100%' }}
              >
                <option value="en" style={{ background: 'var(--bg-secondary)' }}>English</option>
                <option value="hi" style={{ background: 'var(--bg-secondary)' }}>हिंदी (Hindi)</option>
                <option value="es" style={{ background: 'var(--bg-secondary)' }}>Español</option>
              </select>
            </div>

            <div
              className={`nav-item ${showSettings ? 'active' : ''}`}
              onClick={() => { setTempKey(apiKey); setTempBizName(businessName); setShowSettings(true); }}
              style={{ marginTop: 0 }}
            >
              <Settings size={18} />
              <span>{t('settings')}</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="main-content">
        {selectedTab === 'dashboard'  && <Dashboard  database={database} t={t} lang={lang} />}
        {selectedTab === 'profitLoss' && <ProfitLoss database={database} t={t} lang={lang} />}
        {selectedTab === 'chatbot'    && <Chatbot    database={database} apiKey={apiKey} t={t} lang={lang} />}
        {selectedTab === 'inventory'  && <Inventory  database={database} setDatabase={setDatabase} t={t} lang={lang} />}
        {selectedTab === 'billing'    && <Billing    database={database} setDatabase={setDatabase} cashierName={currentUser.label} />}
        {selectedTab === 'orders'     && <Orders      database={database} setDatabase={setDatabase} />}
        {selectedTab === 'menu'       && <MenuManager />}
        {selectedTab === 'expenses'   && <Expenses   database={database} setDatabase={setDatabase} t={t} lang={lang} />}
        {selectedTab === 'marketing'  && <Marketing  database={database} apiKey={apiKey} t={t} lang={lang} />}
        {selectedTab === 'insights'   && <Insights   database={database} t={t} lang={lang} />}
      </main>

      {/* ── Settings Modal ───────────────────────────────────────── */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '480px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings className="brand-icon" size={22} /> Copilot Settings
              </h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Business / Shop Name</label>
                <input type="text" value={tempBizName} onChange={(e) => setTempBizName(e.target.value)} className="form-control" required />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gemini API Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none' }}>Get Key ↗</a>
                </label>
                <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} className="form-control" placeholder="Paste your AI Studio API key here" />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Keys are saved locally in your browser and never sent elsewhere.</span>
              </div>

              {/* Firebase info (read-only) */}
              <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>🔥 Firebase Connected</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#78716c' }}>Project: smbs-d661e &nbsp;|&nbsp; Firestore live sync enabled</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#78716c' }}>{sales.length} sales &nbsp;·&nbsp; {inventory.length} inventory &nbsp;·&nbsp; {orders.length} orders &nbsp;·&nbsp; {expenses.length} expenses</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
