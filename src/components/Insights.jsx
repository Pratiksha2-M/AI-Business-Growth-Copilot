import React, { useState } from 'react';
import { MessageSquare, Phone, Bell, Send, Check } from 'lucide-react';

export default function Insights({ database, t, lang }) {
  const { sales, expenses, inventory } = database;
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [frequency, setFrequency] = useState('weekly');
  const [testSent, setTestSent] = useState(false);

  // Compute live data for WhatsApp preview
  const totalRev = sales.reduce((sum, item) => sum + item.amount, 0);
  const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRev - totalExp;
  const lowStock = inventory.filter(i => i.stock < i.minStock).map(i => i.name).join(', ');

  const getWhatsAppMessageText = () => {
    const brandName = lang === 'hi' ? 'Brewtopia कैफ़े' : lang === 'es' ? 'Café Brewtopia' : 'Brewtopia Café';
    const profitEmoji = netProfit >= 0 ? '📈' : '📉';

    if (lang === 'hi') {
      return `📊 *${brandName} - साप्ताहिक रिपोर्ट* 📊

💰 *कमाई:* ₹${totalRev.toLocaleString()}
💸 *खर्च:* ₹${totalExp.toLocaleString()}
${profitEmoji} *शुद्ध लाभ:* ₹${netProfit.toLocaleString()}

⚠️ *स्टॉक अलर्ट:* ${lowStock || 'सभी वस्तुएं सुरक्षित हैं'}

🤖 *एआई सुझाव:* आपके 'Milk' का स्टॉक कम है। शनिवार की सेल को देखते हुए कृपया आज ही रीस्टॉक करें।

_भेजा गया: एआई बिजनेस ग्रोथ कोपायलट द्वारा_`;
    } else if (lang === 'es') {
      return `📊 *${brandName} - Resumen Semanal* 📊

💰 *Ventas:* ₹${totalRev.toLocaleString()}
💸 *Gastos:* ₹${totalExp.toLocaleString()}
${profitEmoji} *Ganancia Neta:* ₹${netProfit.toLocaleString()}

⚠️ *Alertas de Stock:* ${lowStock || 'Ninguno, stock saludable'}

🤖 *Consejo AI:* Su stock de leche está por agotarse. Ordene hoy para evitar desabastecimiento el fin de semana.

_Generado por AI Business Copilot_`;
    } else {
      return `📊 *${brandName} - Weekly Report* 📊

💰 *Revenue:* ₹${totalRev.toLocaleString()}
💸 *Expenses:* ₹${totalExp.toLocaleString()}
${profitEmoji} *Net Profit:* ₹${netProfit.toLocaleString()}

⚠️ *Stock Alerts:* ${lowStock || 'All items healthy'}

🤖 *AI Suggestion:* Milk inventory is low. Restock today to avoid missing weekend morning sales.

_Sent via AI Business Growth Copilot_`;
    }
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('businessInsightsAlerts')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'व्हाट्सएप या ईमेल के माध्यम से अपने फोन पर साप्ताहिक व्यापार सारांश प्राप्त करें।' : lang === 'es' ? 'Reciba resúmenes semanales de su negocio directamente en WhatsApp o correo electrónico.' : 'Receive automated performance summaries and stock alerts directly on your phone.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }} className="insights-config-layout">
        
        {/* Left Side: Configurations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} className="brand-icon" /> Notification Preferences
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t('insightsDescription')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
              {/* WhatsApp Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: '0.95rem' }}>WhatsApp Automated Insights</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sends performance cards directly to business owner</span>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={alertsEnabled}
                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span className="slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: alertsEnabled ? 'var(--accent-purple)' : '#374151',
                    transition: '.4s', borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      transform: alertsEnabled ? 'translateX(24px)' : 'none'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Delivery Frequency */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Alert Frequency</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {['daily', 'weekly', 'monthly'].map(f => (
                    <button
                      key={f}
                      type="button"
                      className={`btn ${frequency === f ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flexGrow: 1, textTransform: 'capitalize', fontSize: '0.85rem', padding: '0.5rem' }}
                      onClick={() => setFrequency(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">WhatsApp Contact Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  defaultValue="+91 98765 43210" 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSendTest}
              disabled={testSent}
            >
              {testSent ? <Check size={16} /> : <Send size={16} />}
              {testSent ? 'Test Message Dispatched!' : 'Send Test WhatsApp Alert'}
            </button>
          </div>
          
        </div>

        {/* Right Side: Mock Phone screen */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Smartphone Frame mockup */}
          <div style={{
            width: '320px',
            height: '560px',
            background: '#070a13',
            border: '8px solid #2d3748',
            borderRadius: '32px',
            padding: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Phone Notch */}
            <div style={{
              width: '100px',
              height: '18px',
              background: '#2d3748',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              zIndex: 10
            }}></div>

            {/* WhatsApp App Interface */}
            <div style={{
              flexGrow: 1,
              background: '#0b141a', // WhatsApp dark mode bg
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              
              {/* WA Header */}
              <div style={{ background: '#1f2c34', padding: '1.25rem 0.75rem 0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #2f3b43' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justify: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  Copilot
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e9edef' }}>Growth Copilot</div>
                  <div style={{ fontSize: '0.65rem', color: '#8696a0' }}>online</div>
                </div>
              </div>

              {/* WA Chat Body */}
              <div style={{
                flexGrow: 1,
                padding: '1rem 0.5rem',
                backgroundImage: 'radial-gradient(#1e2a30 1px, transparent 0)',
                backgroundSize: '16px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflowY: 'auto'
              }}>
                {alertsEnabled ? (
                  <div style={{
                    background: '#202c33', // WA message bubble bg
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#e9edef',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    maxWidth: '90%',
                    alignSelf: 'flex-start',
                    borderTopLeftRadius: 0,
                    boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)',
                    whiteSpace: 'pre-wrap',
                    position: 'relative'
                  }}>
                    {getWhatsAppMessageText()}
                    <div style={{ fontSize: '0.6rem', color: '#8696a0', textAlign: 'right', marginTop: '0.25rem' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#8696a0', fontSize: '0.75rem', padding: '1rem' }}>
                    Alerts disabled. Toggle "WhatsApp Automated Insights" on the left to see preview.
                  </div>
                )}
              </div>

              {/* WA Input Footer */}
              <div style={{ background: '#1f2c34', padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flexGrow: 1, height: '30px', background: '#2a3942', borderRadius: '15px', padding: '0.4rem 0.75rem', color: '#8696a0', fontSize: '0.75rem' }}>
                  Message
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
