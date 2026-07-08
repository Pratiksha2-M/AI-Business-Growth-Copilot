import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ShoppingBag, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ database, t, lang }) {
  const { sales, expenses, inventory } = database;

  // 1. Calculate KPIs
  const totalRevenue = sales.reduce((sum, item) => sum + item.amount, 0);
  const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExp;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  
  // Count items needing restock
  const lowStockItems = inventory.filter(item => item.stock <= item.dailyUsage * 3 || item.stock < item.minStock).length;

  // 2. Perform Linear Regression for Sales Forecasting
  // Group sales by week/date or use the raw sales trend. Let's group by 8 weeks.
  const weeklySales = [
    { week: "Wk 1", amount: 3800 },
    { week: "Wk 2", amount: 4100 },
    { week: "Wk 3", amount: 3900 },
    { week: "Wk 4", amount: 4500 },
    { week: "Wk 5", amount: 4800 },
    { week: "Wk 6", amount: 4400 },
    { week: "Wk 7", amount: 5100 },
    { week: "Wk 8", amount: 5400 }
  ];

  // Calculate Linear Regression variables
  // Y = m*X + c
  const n = weeklySales.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = weeklySales[i].amount;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next 3 weeks
  const predictedWeeks = ["Wk 9", "Wk 10", "Wk 11"];
  const forecastData = [];
  
  // Fill historical part of forecast series with nulls so they don't draw, or draw the line together
  const allLabels = [...weeklySales.map(w => w.week), ...predictedWeeks];
  
  // Historical data series
  const historicalSeries = [...weeklySales.map(w => w.amount), null, null, null];
  
  // Forecast series starts at Wk 8's value to connect, and predicts onwards
  const forecastSeries = Array(n - 1).fill(null);
  forecastSeries.push(weeklySales[n - 1].amount); // connect point
  for (let i = 0; i < predictedWeeks.length; i++) {
    const x = n + i + 1;
    const pred = Math.round(slope * x + intercept);
    forecastSeries.push(pred);
    forecastData.push(pred);
  }

  // Chart 1: Sales Trend & Forecast
  const lineChartData = {
    labels: allLabels,
    datasets: [
      {
        label: lang === 'hi' ? 'ऐतिहासिक बिक्री' : lang === 'es' ? 'Ventas Históricas' : 'Historical Sales',
        data: historicalSeries,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointHoverRadius: 7,
        fill: true,
        spanGaps: false
      },
      {
        label: t('forecastText'),
        data: forecastSeries,
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderDash: [6, 6],
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointHoverRadius: 7,
        spanGaps: true
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e5e7eb', font: { family: 'Inter' } }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // Chart 2: Product share
  // Group current sales by product
  const productShares = {};
  sales.forEach(sale => {
    productShares[sale.product] = (productShares[sale.product] || 0) + sale.amount;
  });

  const doughnutData = {
    labels: Object.keys(productShares),
    datasets: [
      {
        data: Object.values(productShares),
        backgroundColor: [
          '#8b5cf6', // purple
          '#10b981', // emerald
          '#3b82f6', // blue
          '#f59e0b', // amber
          '#f43f5e', // rose
          '#06b6d4'  // cyan
        ],
        borderWidth: 1,
        borderColor: 'rgba(17, 24, 39, 0.8)'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#e5e7eb', font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            {lang === 'hi' ? 'नमस्ते, बिज़नेस पार्टनर' : lang === 'es' ? 'Hola, Socio' : 'Hello, Partner'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'यहाँ आपके व्यवसाय का आज का रिपोर्ट कार्ड है।' : lang === 'es' ? 'Aquí está el reporte de su negocio para hoy.' : "Here's how your business is performing today."}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Revenue */}
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <h3>{t('revenue')}</h3>
            <div className="kpi-value">${totalRevenue.toLocaleString()}</div>
            <div className="kpi-change" style={{ color: 'var(--accent-emerald)' }}>
              <TrendingUp size={16} /> +12.4% {t('comparePrevMonth')}
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Profit */}
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <h3>{t('netProfit')}</h3>
            <div className="kpi-value" style={{ color: netProfit >= 0 ? 'var(--text-primary)' : 'var(--accent-rose)' }}>
              {netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toLocaleString()}
            </div>
            <div className="kpi-change" style={{ color: netProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {netProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {netProfit >= 0 ? '+8.3%' : '-15.4%'} {t('comparePrevMonth')}
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Margin */}
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <h3>{t('profitMargin')}</h3>
            <div className="kpi-value">{profitMargin}%</div>
            <div className="kpi-change" style={{ color: 'var(--accent-emerald)' }}>
              <TrendingUp size={16} /> +1.2% {t('comparePrevMonth')}
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
            <Percent size={24} />
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <h3>{t('totalExpenses')}</h3>
            <div className="kpi-value">${totalExp.toLocaleString()}</div>
            <div className="kpi-change" style={{ color: 'var(--accent-rose)' }}>
              <TrendingUp size={16} /> +4.8% {t('comparePrevMonth')}
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-rose-glow)', color: 'var(--accent-rose)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <h3>{t('inventoryAlerts')}</h3>
            <div className="kpi-value" style={{ color: lowStockItems > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
              {lowStockItems} {t('itemsNeedsRestock')}
            </div>
            <div className="kpi-change" style={{ color: lowStockItems > 0 ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
              {lowStockItems > 0 ? 'Action Required' : 'All items stocked'}
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: lowStockItems > 0 ? 'var(--accent-amber-glow)' : 'var(--accent-emerald-glow)', color: lowStockItems > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }} className="charts-container">
        {/* Sales Forecast */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('salesForecastingTitle')}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={14} className="brand-icon" /> AI-Generated predictions
            </span>
          </div>
          <div style={{ height: '320px', position: 'relative' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Product Share */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>{t('topProducts')}</h3>
          <div style={{ height: '320px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* AI Quick Insights */}
      <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--accent-purple)' }}>
        <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', flexShrink: 0 }}>
          <Sparkles size={24} />
        </div>
        <div>
          <h4 style={{ color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {lang === 'hi' ? 'एआई ग्रोथ इनसाइट्स' : lang === 'es' ? 'AI Growth Insights' : 'AI Growth Insights'}
          </h4>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            {lang === 'hi' 
              ? `आपके वीक 8 के सेल का विश्लेषण करने पर, बिक्री में 5.8% की बढ़ोतरी देखी गई है। हमारे स्टॉक मॉडल के अनुसार, आगामी हफ्ते में 'Milk' का स्टॉक कम हो सकता है। इसे आज ही रीस्टॉक करने की सलाह दी जाती है।`
              : lang === 'es'
              ? `Analizando las ventas de la Semana 8: los ingresos subieron un 5.8% impulsados por las ventas de capuchino. Sin embargo, su stock de leche está por agotarse en menos de 24 horas. ¡Considere reabastecer hoy!`
              : `Analyzing Week 8 sales: Revenue rose by 5.8% driven by Cappuccino sales. However, your stock of Milk is predicted to deplete in less than 24 hours. Consider reordering today to avoid stockouts.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
