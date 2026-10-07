import React, { useState, useRef } from 'react';
import { FileText, Camera, Upload, Trash2, Plus, AlertCircle, Sparkles } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function Expenses({ database, setDatabase, t, lang }) {
  const { expenses } = database;
  
  const [expenseForm, setExpenseForm] = useState({ vendor: '', category: 'Inventory', amount: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrResult, setOcrResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // Preset invoices for demonstration
  const presets = [
    {
      name: "Star Coffee Imports Invoice",
      vendor: "Star Coffee Importers",
      category: "Inventory",
      amount: "850.00",
      date: new Date().toISOString().slice(0, 10),
      rawText: "INVOICE #SC-9810\nDate: 2026-07-02\nSTAR COFFEE IMPORTERS LTD\nItems:\n- 100kg Arabica Beans - ₹600.00\n- 50kg Robusta Beans - ₹250.00\nSUBTOTAL: ₹850.00\nTAX (GST 0%): ₹0.00\nTOTAL AMOUNT DUE: ₹850.00\nThank you for your business!"
    },
    {
      name: "City Power & Light Receipt",
      vendor: "City Power & Light",
      category: "Utilities",
      amount: "320.40",
      date: new Date().toISOString().slice(0, 10),
      rawText: "CITY POWER & LIGHT CO.\nPayment Receipt\nAccount: #8871-002\nTransaction: #TXN-7718A\nElectricity usage (June): ₹271.53\nGST (18%): ₹48.87\nTOTAL PAID: ₹320.40\nStatus: PAID - AutoDebit"
    },
    {
      name: "Local Milk Supply Bill",
      vendor: "Daily Fresh Milk",
      category: "Inventory",
      amount: "180.00",
      date: new Date().toISOString().slice(0, 10),
      rawText: "DAILY FRESH MILK DIARIES\nBILL TO: Brewtopia Cafe\nInvoice No: 442\nDetails:\n60 Liters Whole Milk @ ₹3.00/L = ₹180.00\nNet Total: ₹180.00\nCGST 2.5%: ₹4.50\nSGST 2.5%: ₹4.50\nGross Total: ₹189.00\nCash Payment Received: ₹180.00"
    }
  ];

  // Helper to parse invoice text for totals
  const parseInvoiceText = (text) => {
    // Simple parser searching for keywords
    const lines = text.split('\n');
    let detectedTotal = '';
    let detectedVendor = '';

    // Guess vendor from first few lines
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      if (lines[i].trim().length > 3 && !lines[i].toLowerCase().includes('invoice') && !lines[i].toLowerCase().includes('receipt')) {
        detectedVendor = lines[i].trim();
        break;
      }
    }

    // Guess total amount by matching numbers near "total", "paid", or "₹"
    const totalRegex = /(?:total|paid|due|amount)\D*(\d+(?:\.\d{2})?)/i;
    for (let line of lines) {
      const match = line.match(totalRegex);
      if (match) {
        detectedTotal = match[1];
      }
    }

    // Default fallbacks if regex missed
    if (!detectedTotal) {
      const moneyRegex = /(?:₹|\$)\s*(\d+(?:\.\d{2})?)/;
      for (let line of lines) {
        const match = line.match(moneyRegex);
        if (match) {
          detectedTotal = match[1];
        }
      }
    }

    return {
      vendor: detectedVendor || 'Unknown Vendor',
      amount: detectedTotal || '0.00',
      date: new Date().toISOString().slice(0, 10)
    };
  };

  // OCR Scan using Tesseract.js (real file upload)
  const handleOcrFile = (file) => {
    if (!file) return;
    setLoading(true);
    setOcrStatus(t('ocrProcessing'));
    setOcrResult(null);

    Tesseract.recognize(
      file,
      'eng',
      { logger: m => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`Recognizing: ${Math.round(m.progress * 100)}%`);
          } else {
            setOcrStatus(m.status);
          }
        } 
      }
    ).then(({ data: { text } }) => {
      const parsed = parseInvoiceText(text);
      setOcrResult({
        rawText: text,
        parsed: parsed
      });
      setExpenseForm({
        vendor: parsed.vendor,
        category: 'Inventory',
        amount: parsed.amount,
        date: parsed.date
      });
      setLoading(false);
      setOcrStatus('');
    }).catch(err => {
      console.error(err);
      setOcrStatus('OCR failed: Network or file error.');
      setLoading(false);
    });
  };

  // Preset OCR simulation (instant & reliable demo)
  const handlePresetSelect = (preset) => {
    setLoading(true);
    setOcrStatus('Simulating OCR Scanner...');
    setOcrResult(null);

    setTimeout(() => {
      const parsed = {
        vendor: preset.vendor,
        category: preset.category,
        amount: preset.amount,
        date: preset.date
      };
      setOcrResult({
        rawText: preset.rawText,
        parsed: parsed
      });
      setExpenseForm(parsed);
      setLoading(false);
      setOcrStatus('');
    }, 1500);
  };

  // Handle Form Change
  const handleChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  // Manual Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.vendor || !expenseForm.amount || !expenseForm.date) return;

    const newExpense = {
      id: Date.now(),
      vendor: expenseForm.vendor,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date
    };

    setDatabase(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));

    // Reset Form
    setExpenseForm({ vendor: '', category: 'Inventory', amount: '', date: '' });
    setOcrResult(null);
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    setDatabase(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== id)
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('expenses')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'खर्चों को रिकॉर्ड करें या रसीदों को तुरंत स्कैन करने के लिए ओसीआर (OCR) का उपयोग करें।' : lang === 'es' ? 'Registre gastos o escanee recibos al instante con reconocimiento OCR.' : 'Track expenses or use client-side OCR to scan supplier invoices instantly.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }} className="expenses-container">
        {/* Left Column: OCR & Adding Expense */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* OCR Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={22} className="brand-icon" /> {t('scanInvoiceBtn')}
            </h3>

            {/* Presets Row */}
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Quick Demo Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {presets.map((preset, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => handlePresetSelect(preset)}
                    disabled={loading}
                  >
                    {preset.name.split(' ')[0]} Receipt
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div 
              style={{
                border: '2px dashed var(--card-border)',
                borderRadius: '12px',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                {t('dragInvoiceHere')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports PNG, JPG (Client-side Tesseract.js)
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={(e) => handleOcrFile(e.target.files[0])}
              />
            </div>

            {/* Scanning Progress */}
            {loading && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--accent-purple)', textAlign: 'center' }}>
                <div className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {ocrStatus}
                </span>
              </div>
            )}

            {/* OCR Log & Results Preview */}
            {ocrResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={14} /> {t('ocrSuccess')} ₹{ocrResult.parsed.amount}
                </div>
                <div style={{ fontSize: '0.75rem', maxHeight: '100px', overflowY: 'auto', background: '#070a13', padding: '0.5rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {ocrResult.rawText}
                </div>
              </div>
            )}
          </div>

          {/* Add Expense Form */}
          <div className="glass-card">
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('addExpense')}</h3>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('vendor')}</label>
                <input 
                  type="text" 
                  name="vendor"
                  value={expenseForm.vendor}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="e.g. Star Coffee Importers"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('category')}</label>
                  <select 
                    name="category"
                    value={expenseForm.category}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Inventory">Inventory (COGS)</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('amount')} (₹)</label>
                  <input 
                    type="number" 
                    step="any"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleChange}
                    className="form-control" 
                    placeholder="e.g. 150.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('date')}</label>
                <input 
                  type="date" 
                  name="date"
                  value={expenseForm.date}
                  onChange={handleChange}
                  className="form-control" 
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Save Expense Record
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Expense History list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} className="brand-icon" /> {t('expenseTracker')}
          </h3>
          
          <div className="table-container" style={{ maxHeight: '680px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('vendor')}</th>
                  <th>{t('category')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('date')}</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600 }}>{exp.vendor}</td>
                    <td>
                      <span className={`badge ${
                        exp.category === 'Inventory' ? 'badge-success' :
                        exp.category === 'Utilities' ? 'badge-info' :
                        exp.category === 'Rent' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>
                      -₹{exp.amount.toFixed(2)}
                    </td>
                    <td>{exp.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.15)' }}
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
