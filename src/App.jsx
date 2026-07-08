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
  Eye
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProfitLoss from './components/ProfitLoss';
import Chatbot from './components/Chatbot';
import Inventory from './components/Inventory';
import Expenses from './components/Expenses';
import Marketing from './components/Marketing';
import Insights from './components/Insights';
import { translations } from './utils/translations';

// Default mock database structure
const INITIAL_DATABASE = {
  sales: [
    { id: 1, date: "2026-06-01", amount: 15, product: "Espresso", quantity: 3, gst: 2.7 },
    { id: 2, date: "2026-06-03", amount: 180, product: "Espresso", quantity: 36, gst: 32.4 },
    { id: 3, date: "2026-06-08", amount: 450, product: "Cappuccino", quantity: 90, gst: 81.0 },
    { id: 4, date: "2026-06-15", amount: 620, product: "Latte", quantity: 124, gst: 111.6 },
    { id: 5, date: "2026-06-20", amount: 240, product: "Pastry", quantity: 48, gst: 43.2 },
    { id: 6, date: "2026-06-24", amount: 110, product: "Tea", quantity: 22, gst: 19.8 },
    { id: 7, date: "2026-06-28", amount: 980, product: "Cappuccino", quantity: 196, gst: 176.4 },
    { id: 8, date: "2026-07-02", amount: 820, product: "Latte", quantity: 164, gst: 147.6 },
    { id: 9, date: "2026-07-05", amount: 390, product: "Pastry", quantity: 78, gst: 70.2 }
  ],
  expenses: [
    { id: 1, date: "2026-06-05", vendor: "Star Coffee Importers", category: "Inventory", amount: 650 },
    { id: 2, date: "2026-06-12", vendor: "City Power & Light", category: "Utilities", amount: 280 },
    { id: 3, date: "2026-06-15", vendor: "Daily Milk Supply", category: "Inventory", amount: 180 },
    { id: 4, date: "2026-06-20", vendor: "RentCorp Holdings", category: "Rent", amount: 1200 },
    { id: 5, date: "2026-06-25", vendor: "Local Ads & Promo", category: "Marketing", amount: 150 },
    { id: 6, date: "2026-07-01", vendor: "City Water Board", category: "Utilities", amount: 95 }
  ],
  inventory: [
    { id: 1, name: "Coffee Beans (kg)", stock: 12.5, dailyUsage: 1.5, minStock: 5 },
    { id: 2, name: "Milk (Liters)", stock: 8.0, dailyUsage: 12.0, minStock: 15 },
    { id: 3, name: "Sugar (kg)", stock: 22.0, dailyUsage: 0.8, minStock: 4 },
    { id: 4, name: "Paper Cups", stock: 150, dailyUsage: 45.0, minStock: 100 },
    { id: 5, name: "Syrups (Bottles)", stock: 18.0, dailyUsage: 0.5, minStock: 2 }
  ]
};

export default function App() {
  // Load initial settings
  const [lang, setLang] = useState(() => localStorage.getItem('growth_copilot_lang') || 'en');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('growth_copilot_gemini_key') || '');
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('growth_copilot_biz_name') || 'Brewtopia Cafe');
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempBizName, setTempBizName] = useState(businessName);
  
  // Database load
  const [database, setDatabase] = useState(() => {
    const saved = localStorage.getItem('growth_copilot_db');
    return saved ? JSON.parse(saved) : INITIAL_DATABASE;
  });

  // Sync Database
  useEffect(() => {
    localStorage.setItem('growth_copilot_db', JSON.stringify(database));
  }, [database]);

  // Translate helper
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  // Save Settings handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setApiKey(tempKey);
    setBusinessName(tempBizName);
    localStorage.setItem('growth_copilot_gemini_key', tempKey);
    localStorage.setItem('growth_copilot_biz_name', tempBizName);
    setShowSettings(false);
  };

  // Change Language handler
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('growth_copilot_lang', newLang);
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'profitLoss', label: t('profitLoss'), icon: FileSpreadsheet },
    { id: 'chatbot', label: t('chatbot'), icon: Bot },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'expenses', label: t('expenses'), icon: Camera },
    { id: 'marketing', label: t('marketing'), icon: Megaphone },
    { id: 'insights', label: t('insights'), icon: Bell }
  ];

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <Store className="brand-icon" size={26} />
          <span>{businessName}</span>
        </div>

        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ul className="nav-menu">
            {navItems.map(item => {
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

          {/* Bottom Sidebar: Language & Settings */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
              <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
              <select 
                value={lang} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.85rem', 
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <option value="en" style={{ background: 'var(--bg-secondary)' }}>English</option>
                <option value="hi" style={{ background: 'var(--bg-secondary)' }}>हिंदी (Hindi)</option>
                <option value="es" style={{ background: 'var(--bg-secondary)' }}>Español</option>
              </select>
            </div>

            {/* Settings Trigger */}
            <div 
              className={`nav-item ${showSettings ? 'active' : ''}`}
              onClick={() => {
                setTempKey(apiKey);
                setTempBizName(businessName);
                setShowSettings(true);
              }}
              style={{ marginTop: 0 }}
            >
              <Settings size={18} />
              <span>{t('settings')}</span>
            </div>

          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {selectedTab === 'dashboard' && <Dashboard database={database} t={t} lang={lang} />}
        {selectedTab === 'profitLoss' && <ProfitLoss database={database} t={t} lang={lang} />}
        {selectedTab === 'chatbot' && <Chatbot database={database} apiKey={apiKey} t={t} lang={lang} />}
        {selectedTab === 'inventory' && <Inventory database={database} setDatabase={setDatabase} t={t} lang={lang} />}
        {selectedTab === 'expenses' && <Expenses database={database} setDatabase={setDatabase} t={t} lang={lang} />}
        {selectedTab === 'marketing' && <Marketing database={database} apiKey={apiKey} t={t} lang={lang} />}
        {selectedTab === 'insights' && <Insights database={database} t={t} lang={lang} />}
      </main>

      {/* Settings Modal Drawer */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '480px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings className="brand-icon" size={22} /> Copilot Settings
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Business / Shop Name</label>
                <input 
                  type="text" 
                  value={tempBizName} 
                  onChange={(e) => setTempBizName(e.target.value)}
                  className="form-control" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gemini API Key</span>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none' }}
                  >
                    Get Key ↗
                  </a>
                </label>
                <input 
                  type="password" 
                  value={tempKey} 
                  onChange={(e) => setTempKey(e.target.value)}
                  className="form-control" 
                  placeholder="Paste your AI Studio API key here"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Keys are saved locally in your browser storage and never sent elsewhere.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
