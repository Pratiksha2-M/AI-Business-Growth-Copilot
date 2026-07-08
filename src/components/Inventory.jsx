import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Edit2, RotateCcw } from 'lucide-react';

export default function Inventory({ database, setDatabase, t, lang }) {
  const { inventory } = database;
  
  const [newItem, setNewItem] = useState({ name: '', stock: '', dailyUsage: '', minStock: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Restock Status Calculator
  const getRestockStatus = (item) => {
    const daysRemaining = item.dailyUsage > 0 ? item.stock / item.dailyUsage : Infinity;
    
    if (daysRemaining <= 2 || item.stock < item.minStock) {
      return { 
        text: t('restockNow'), 
        badgeClass: 'badge-danger',
        days: daysRemaining.toFixed(1)
      };
    } else if (daysRemaining <= 5) {
      return { 
        text: t('restockSoon'), 
        badgeClass: 'badge-warning',
        days: daysRemaining.toFixed(1)
      };
    } else {
      return { 
        text: t('stockHealthy'), 
        badgeClass: 'badge-success',
        days: daysRemaining.toFixed(1)
      };
    }
  };

  // Add Item to inventory
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock || !newItem.dailyUsage || !newItem.minStock) return;

    const added = {
      id: Date.now(),
      name: newItem.name,
      stock: parseFloat(newItem.stock),
      dailyUsage: parseFloat(newItem.dailyUsage),
      minStock: parseFloat(newItem.minStock)
    };

    setDatabase(prev => ({
      ...prev,
      inventory: [...prev.inventory, added]
    }));

    setNewItem({ name: '', stock: '', dailyUsage: '', minStock: '' });
    setShowAddForm(false);
  };

  // Reset Inventory to defaults
  const resetToDefault = () => {
    const defaultInventory = [
      { id: 1, name: "Coffee Beans (kg)", stock: 12, dailyUsage: 1.5, minStock: 5 },
      { id: 2, name: "Milk (Liters)", stock: 8, dailyUsage: 12.0, minStock: 15 },
      { id: 3, name: "Sugar (kg)", stock: 25, dailyUsage: 0.8, minStock: 4 },
      { id: 4, name: "Paper Cups", stock: 150, dailyUsage: 45.0, minStock: 100 },
      { id: 5, name: "Syrups (Bottles)", stock: 18, dailyUsage: 0.5, minStock: 2 }
    ];
    setDatabase(prev => ({
      ...prev,
      inventory: defaultInventory
    }));
  };

  // Quick Restock helper
  const handleQuickRestock = (itemId, amount) => {
    setDatabase(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.id === itemId 
          ? { ...item, stock: item.stock + amount }
          : item
      )
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('inventoryPredictorTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'दैनिक खपत के आधार पर आने वाली सामग्री की आवश्यकताओं का पूर्वानुमान।' : lang === 'es' ? 'Previsiones de stock y necesidades de compra basadas en el consumo diario.' : 'Predictive restocking recommendations based on item usage speed.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={resetToDefault}>
            <RotateCcw size={16} /> Reset Default
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> {showAddForm ? 'Close Form' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">{t('itemName')}</label>
            <input 
              type="text" 
              className="form-control" 
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="e.g. Cocoa Powder (kg)"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('currentStock')}</label>
            <input 
              type="number" 
              step="any"
              className="form-control" 
              value={newItem.stock}
              onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
              placeholder="e.g. 15"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('dailyUsage')}</label>
            <input 
              type="number" 
              step="any"
              className="form-control" 
              value={newItem.dailyUsage}
              onChange={(e) => setNewItem({...newItem, dailyUsage: e.target.value})}
              placeholder="e.g. 1.2"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Stock Threshold</label>
            <input 
              type="number" 
              step="any"
              className="form-control" 
              value={newItem.minStock}
              onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
              placeholder="e.g. 5"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginBottom: '1.25rem', height: '45px' }}>
            Add Product
          </button>
        </form>
      )}

      {/* Inventory List Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={22} className="brand-icon" /> Stock Status
        </h3>
        
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('itemName')}</th>
                <th>{t('currentStock')}</th>
                <th>{t('dailyUsage')}</th>
                <th>Min Alert level</th>
                <th>{t('daysRemaining')}</th>
                <th>{t('predictedStatus')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const status = getRestockStatus(item);
                const isInfinite = status.days === 'Infinity';
                return (
                  <tr key={item.id} style={{ borderLeft: item.stock < item.minStock ? '3px solid var(--accent-rose)' : 'none' }}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.stock}</td>
                    <td>{item.dailyUsage} / day</td>
                    <td>{item.minStock}</td>
                    <td style={{ fontWeight: 600 }}>
                      {isInfinite ? 'N/A' : `${status.days} days`}
                    </td>
                    <td>
                      <span className={`badge ${status.badgeClass}`}>{status.text}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleQuickRestock(item.id, 10)}
                        >
                          +10 Stock
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleQuickRestock(item.id, 50)}
                        >
                          +50 Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {inventory.filter(item => item.stock <= item.dailyUsage * 3 || item.stock < item.minStock).map(item => {
          const daysLeft = item.dailyUsage > 0 ? (item.stock / item.dailyUsage).toFixed(1) : 0;
          return (
            <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1rem', borderLeft: '4px solid var(--accent-rose)', backgroundColor: 'var(--accent-rose-glow)' }}>
              <AlertCircle size={24} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  Critical Shortage: {item.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Current stock ({item.stock}) will run out in <strong>{daysLeft} days</strong> (threshold is {item.minStock}). Reorder immediately.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
