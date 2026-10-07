import React, { useState } from 'react';
import { Download, Printer, Calculator, FileSpreadsheet } from 'lucide-react';

export default function ProfitLoss({ database, t, lang }) {
  const { sales, expenses } = database;
  const [gstRate, setGstRate] = useState(18); // Default 18% GST

  // Compute values
  const grossSales = sales.reduce((sum, item) => sum + item.amount, 0);
  const cogs = expenses.filter(e => e.category === 'Inventory').reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = grossSales - cogs;
  
  const utilities = expenses.filter(e => e.category === 'Utilities').reduce((sum, item) => sum + item.amount, 0);
  const rent = expenses.filter(e => e.category === 'Rent').reduce((sum, item) => sum + item.amount, 0);
  const marketing = expenses.filter(e => e.category === 'Marketing').reduce((sum, item) => sum + item.amount, 0);
  const otherExpenses = expenses.filter(e => !['Inventory', 'Utilities', 'Rent', 'Marketing'].includes(e.category)).reduce((sum, item) => sum + item.amount, 0);
  const totalOperatingExpenses = utilities + rent + marketing + otherExpenses;
  
  const netProfitBeforeTax = grossProfit - totalOperatingExpenses;
  
  // GST Calculations
  // Output GST (collected on sales)
  const totalOutputGst = sales.reduce((sum, item) => sum + (item.gst || 0), 0);
  // Input GST (paid on expenses, assume invoice values include GST)
  const simulatedInputGst = expenses.reduce((sum, item) => {
    if (['Inventory', 'Utilities', 'Marketing'].includes(item.category)) {
      return sum + (item.amount * (gstRate / (100 + gstRate)));
    }
    return sum;
  }, 0);

  const netGstPayable = Math.max(0, totalOutputGst - simulatedInputGst);

  // CSV Export utility
  const exportToCSV = () => {
    const csvRows = [];
    
    // Header
    csvRows.push(["AI Business Growth Copilot - Profit & Loss Statement"]);
    csvRows.push([`Date Generated: ${new Date().toLocaleDateString()}`]);
    csvRows.push([]);
    csvRows.push(["Particulars", "Amount (₹)"]);
    
    // Rows
    csvRows.push(["Revenue (Sales)", grossSales]);
    csvRows.push(["Less: Cost of Goods Sold (COGS)", cogs]);
    csvRows.push(["Gross Profit", grossProfit]);
    csvRows.push([]);
    csvRows.push(["Operating Expenses", ""]);
    csvRows.push(["  Utilities", utilities]);
    csvRows.push(["  Rent", rent]);
    csvRows.push(["  Marketing", marketing]);
    csvRows.push(["  Other Expenses", otherExpenses]);
    csvRows.push(["Total Operating Expenses", totalOperatingExpenses]);
    csvRows.push([]);
    csvRows.push(["Net Profit Before GST", netProfitBeforeTax]);
    csvRows.push(["Estimated Output GST Collected", totalOutputGst.toFixed(2)]);
    csvRows.push(["Input Tax Credit (GST Claimable)", simulatedInputGst.toFixed(2)]);
    csvRows.push(["Net GST Payable", netGstPayable.toFixed(2)]);
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PL_Statement_${lang}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('profitLoss')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'अपने व्यापार के वित्तीय स्वास्थ्य और करों की समीक्षा करें।' : lang === 'es' ? 'Revise la salud financiera de su negocio y sus impuestos.' : 'Review your business financials and GST obligations.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <Download size={16} /> {t('downloadReport')}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> {t('printReport')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }} className="reports-grid">
        {/* P&L Statement */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{t('profitLossStatement')}</h3>
          </div>
          
          <table className="custom-table" style={{ fontSize: '0.95rem' }}>
            <thead>
              <tr>
                <th>{t('particulars')}</th>
                <th style={{ textAlign: 'right' }}>{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>{lang === 'hi' ? 'सकल बिक्री (राजस्व)' : lang === 'es' ? 'Ventas Brutas' : 'Gross Sales (Revenue)'}</td>
                <td style={{ textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 600 }}>₹{grossSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  {lang === 'hi' ? 'घटाएं: बेचे गए माल की लागत (COGS)' : lang === 'es' ? 'Menos: Costo de Ventas (COGS)' : 'Less: Cost of Goods Sold (COGS)'}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--accent-rose)' }}>-₹{cogs.toLocaleString()}</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--card-border)', borderBottom: '2px solid var(--card-border)' }}>
                <td style={{ fontWeight: 600 }}>{lang === 'hi' ? 'सकल लाभ' : lang === 'es' ? 'Ganancia Bruta' : 'Gross Profit'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{grossProfit.toLocaleString()}</td>
              </tr>
              
              {/* Operating Expenses */}
              <tr>
                <td style={{ fontWeight: 600, paddingTop: '1.5rem' }}>{lang === 'hi' ? 'परिचालन व्यय' : lang === 'es' ? 'Gastos Operativos' : 'Operating Expenses'}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>{lang === 'hi' ? 'बिजली, पानी व अन्य उपयोगिता' : lang === 'es' ? 'Servicios Públicos' : 'Utilities'}</td>
                <td style={{ textAlign: 'right' }}>₹{utilities.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>{lang === 'hi' ? 'किराया' : lang === 'es' ? 'Alquiler' : 'Rent'}</td>
                <td style={{ textAlign: 'right' }}>₹{rent.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>{lang === 'hi' ? 'विज्ञापन व विपणन' : lang === 'es' ? 'Publicidad y Marketing' : 'Marketing'}</td>
                <td style={{ textAlign: 'right' }}>₹{marketing.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>{lang === 'hi' ? 'अन्य विविध व्यय' : lang === 'es' ? 'Otros Gastos' : 'Other Expenses'}</td>
                <td style={{ textAlign: 'right' }}>₹{otherExpenses.toLocaleString()}</td>
              </tr>
              
              <tr style={{ borderTop: '1px solid var(--card-border)' }}>
                <td style={{ fontWeight: 600 }}>{lang === 'hi' ? 'कुल परिचालन व्यय' : lang === 'es' ? 'Total Gastos Operativos' : 'Total Operating Expenses'}</td>
                <td style={{ textAlign: 'right', color: 'var(--accent-rose)', fontWeight: 600 }}>-₹{totalOperatingExpenses.toLocaleString()}</td>
              </tr>
              
              {/* Net Profit */}
              <tr style={{ borderTop: '2px solid var(--accent-purple)', background: 'rgba(139, 92, 246, 0.04)' }}>
                <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-purple)' }}>
                  {lang === 'hi' ? 'शुद्ध परिचालन लाभ' : lang === 'es' ? 'Ganancia Neta Operativa' : 'Net Operating Profit'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: netProfitBeforeTax >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {netProfitBeforeTax >= 0 ? '' : '-'}₹{Math.abs(netProfitBeforeTax).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* GST Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} className="brand-icon" /> {t('gstReportTitle')}
              </h3>
            </div>
            
            {/* Input rate control */}
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">{lang === 'hi' ? 'जीएसटी कर दर (%)' : lang === 'es' ? 'Tasa de Impuesto (%)' : 'GST Tax Rate (%)'}</label>
              <select 
                className="form-control" 
                value={gstRate} 
                onChange={(e) => setGstRate(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value="5">5% (Essential Goods)</option>
                <option value="12">12% (Standard)</option>
                <option value="18">18% (Standard Service)</option>
                <option value="28">28% (Luxury)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Output GST Card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {lang === 'hi' ? 'आउटपुट जीएसटी (बिक्री पर)' : lang === 'es' ? 'IGV de Ventas' : 'Output GST (Collected on Sales)'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                    ₹{totalOutputGst.toFixed(2)}
                  </div>
                </div>
                <span className="badge badge-success">Output Tax</span>
              </div>

              {/* Input GST (ITC) Card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {lang === 'hi' ? 'इनपुट टैक्स क्रेडिट (खरीद पर)' : lang === 'es' ? 'Crédito Fiscal (IGV compras)' : 'Input Tax Credit (GST Claimable)'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
                    ₹{simulatedInputGst.toFixed(2)}
                  </div>
                </div>
                <span className="badge badge-info">Input Credit</span>
              </div>

              {/* Net Payable GST Card */}
              <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent-purple)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {lang === 'hi' ? 'कुल देय जीएसटी (सरकार को)' : lang === 'es' ? 'Impuesto Neto a Pagar' : 'Net GST Payable (to Government)'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.25rem' }}>
                    ₹{netGstPayable.toFixed(2)}
                  </div>
                </div>
                <span className="badge badge-warning" style={{ color: '#fff', background: 'var(--accent-purple)' }}>
                  Payable
                </span>
              </div>
            </div>
          </div>

          {/* Quick GST tips */}
          <div className="glass-card" style={{ display: 'flex', gap: '1rem', borderLeft: '4px solid var(--accent-amber)' }}>
            <div>
              <h4 style={{ color: 'var(--accent-amber)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {lang === 'hi' ? 'टैक्स बचत सुझाव' : lang === 'es' ? 'Consejo de Impuesto' : 'GST Tax-Saving Tip'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {lang === 'hi' 
                  ? `सुनिश्चित करें कि आप अपने सप्लायर इनवॉइस को 'Expenses & OCR' में अपलोड कर रहे हैं। आपके इनपुट टैक्स क्रेडिट (₹${simulatedInputGst.toFixed(0)}) से इस महीने आपके टैक्स में काफी बचत हुई है!`
                  : lang === 'es'
                  ? `Asegúrese de cargar todas las facturas de proveedores. ¡Su crédito fiscal de ₹${simulatedInputGst.toFixed(0)} redujo significativamente el impuesto a pagar de este período!`
                  : `Make sure to upload all your supplier invoices. Your Input Tax Credit of ₹${simulatedInputGst.toFixed(0)} has significantly reduced the net GST payable this month!`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
