import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, ChefHat, ToggleLeft, ToggleRight } from 'lucide-react';
import { listenMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../utils/db';

const CATEGORIES = ['Coffee', 'Beverage', 'Food', 'Snack', 'Dessert', 'Other'];
const EMOJIS = ['☕','🥛','🧋','🍵','🥤','🍰','🥐','🥪','🍩','🍪','🧁','🍫','🥗','🍜','🍕','🌮','🧆','🥞','🍟','🧃'];

export default function MenuManager() {
  const [menuItems, setMenuItems]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [filterCat, setFilterCat]   = useState('All');

  // Form state
  const [form, setForm] = useState({ name: '', category: 'Coffee', price: '', emoji: '☕', available: true });

  // Live Firestore listener
  useEffect(() => {
    const unsub = listenMenuItems((data) => {
      setMenuItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm({ name: '', category: 'Coffee', price: '', emoji: '☕', available: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, emoji: item.emoji, available: item.available });
    setEditingId(item.firestoreId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        await updateMenuItem(editingId, data);
      } else {
        await addMenuItem(data);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (firestoreId, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    await deleteMenuItem(firestoreId);
  };

  const handleToggleAvailable = async (item) => {
    await updateMenuItem(item.firestoreId, { available: !item.available });
  };

  const allCategories = ['All', ...new Set(menuItems.map(m => m.category))];
  const filtered = filterCat === 'All' ? menuItems : menuItems.filter(m => m.category === filterCat);

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}><ChefHat size={22} style={{ marginRight: 8 }} />Menu Management</h1>
          <p style={S.sub}>Add, edit or remove items — cashier sees changes instantly</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={S.addBtn}>
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={S.formCard}>
          <p style={S.formTitle}>{editingId ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</p>
          <form onSubmit={handleSubmit} style={S.formGrid}>
            {/* Emoji picker */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={S.label}>Choose Emoji</label>
              <div style={S.emojiRow}>
                {EMOJIS.map(em => (
                  <button
                    key={em} type="button"
                    onClick={() => setForm(f => ({ ...f, emoji: em }))}
                    style={{ ...S.emojiBtn, ...(form.emoji === em ? S.emojiBtnActive : {}) }}
                  >{em}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={S.label}>Item Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Mocha Latte"
                style={S.input} required
              />
            </div>

            <div>
              <label style={S.label}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={S.input}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={S.label}>Price (₹) *</label>
              <input
                type="number" min="1" step="0.5"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 120"
                style={S.input} required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <label style={S.label}>Available</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, available: !f.available }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {form.available
                  ? <ToggleRight size={28} color="#34d399" />
                  : <ToggleLeft size={28} color="#64748b" />}
              </button>
              <span style={{ fontSize: '0.8rem', color: form.available ? '#34d399' : '#64748b' }}>
                {form.available ? 'On Menu' : 'Hidden'}
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={resetForm} style={S.cancelBtn}><X size={14} /> Cancel</button>
              <button type="submit" disabled={saving} style={S.saveBtn}>
                {saving ? '⏳ Saving...' : <><Check size={14} /> {editingId ? 'Update Item' : 'Add to Menu'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter tabs */}
      <div style={S.catRow}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ ...S.catBtn, ...(filterCat === cat ? S.catBtnActive : {}) }}>
            {cat} {cat !== 'All' && <span style={S.catCount}>{menuItems.filter(m => m.category === cat).length}</span>}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={S.statsRow}>
        <div style={S.statChip}>📋 Total Items: <b>{menuItems.length}</b></div>
        <div style={S.statChip}>✅ Available: <b style={{ color: '#34d399' }}>{menuItems.filter(m => m.available).length}</b></div>
        <div style={S.statChip}>🚫 Hidden: <b style={{ color: '#f87171' }}>{menuItems.filter(m => !m.available).length}</b></div>
      </div>

      {/* Menu Items Table */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading menu from Firebase...</p>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          <ChefHat size={40} color="#334155" />
          <p style={{ color: '#64748b', marginTop: 12 }}>No items in this category yet. Click "Add New Item" to start.</p>
        </div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Emoji', 'Item Name', 'Category', 'Price (₹)', 'Status', 'Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.firestoreId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: item.available ? 1 : 0.5 }}>
                  <td style={{ ...S.td, fontSize: '1.4rem', textAlign: 'center' }}>{item.emoji}</td>
                  <td style={{ ...S.td, fontWeight: 600, color: '#f1f5f9' }}>{item.name}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: CATCOLOR[item.category] || 'rgba(100,116,139,0.2)', color: '#cbd5e1' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#a78bfa' }}>₹{item.price}</td>
                  <td style={S.td}>
                    <button onClick={() => handleToggleAvailable(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {item.available
                        ? <><ToggleRight size={22} color="#34d399" /><span style={{ fontSize: '0.75rem', color: '#34d399' }}>On Menu</span></>
                        : <><ToggleLeft size={22} color="#64748b" /><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hidden</span></>}
                    </button>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleEdit(item)} style={S.editBtn} title="Edit"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(item.firestoreId, item.name)} style={S.deleteBtn} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const CATCOLOR = {
  Coffee:  'rgba(124,58,237,0.25)',
  Beverage:'rgba(6,182,212,0.2)',
  Food:    'rgba(245,158,11,0.2)',
  Snack:   'rgba(239,68,68,0.2)',
  Dessert: 'rgba(236,72,153,0.2)',
  Other:   'rgba(100,116,139,0.2)',
};

const S = {
  root: { padding: '1.5rem', fontFamily: "'Inter','Outfit',sans-serif", animation: 'fadeInUp 0.3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', margin: 0 },
  sub: { color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 30px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },

  formCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' },
  formTitle: { fontWeight: 700, color: '#a78bfa', fontSize: '1rem', marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'start' },
  label: { fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem 0.85rem', color: '#f1f5f9', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' },
  emojiRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  emojiBtn: { fontSize: '1.2rem', padding: '4px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer' },
  emojiBtnActive: { background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(167,139,250,0.5)' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' },

  catRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' },
  catBtn: { padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 },
  catBtnActive: { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', borderColor: 'transparent' },
  catCount: { background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0 5px', fontSize: '0.7rem' },

  statsRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  statChip: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: '#94a3b8' },

  tableWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.88rem', color: '#cbd5e1', verticalAlign: 'middle' },
  badge: { padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600 },
  editBtn: { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center' },
  empty: { textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
};
