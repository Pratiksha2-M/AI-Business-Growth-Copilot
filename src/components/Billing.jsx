import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, Receipt, CheckCircle, X, Coffee, Loader2
} from 'lucide-react';
import { listenMenuItems } from '../utils/db';

const GST_RATE = 0.05; // 5% GST on food & beverages

export default function Billing({ database, setDatabase, cashierName }) {
  // ── Load menu from Firestore live ──
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    const unsub = listenMenuItems((items) => {
      // Only show available items to cashier
      setMenuItems(items.filter(i => i.available !== false));
      setMenuLoading(false);
    });
    return () => unsub();
  }, []);

  const CATEGORIES = ['All', ...new Set(menuItems.map(m => m.category))];
  const [cart, setCart] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [showBill, setShowBill] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [success, setSuccess] = useState(false);

  // ── Cart operations ──
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.firestoreId === item.firestoreId);
      if (existing) {
        return prev.map((c) => c.firestoreId === item.firestoreId ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (fid, delta) => {
    setCart((prev) =>
      prev
        .map((c) => c.firestoreId === fid ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (fid) => setCart((prev) => prev.filter((c) => c.firestoreId !== fid));
  const clearCart = () => { setCart([]); setCustomerName(''); setTableNo(''); };

  // ── Totals ──
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gst;
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  // ── Generate Bill & Save Order ──
  const handleGenerateBill = () => {
    if (cart.length === 0) return;
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerName: customerName || 'Walk-in Customer',
      tableNo: tableNo || '-',
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price, total: c.price * c.qty })),
      subtotal,
      gst,
      grandTotal,
      cashier: cashierName || 'Cashier',
      status: 'Paid',
    };
    setSavedOrder(order);
    setShowBill(true);
  };

  // ── Confirm & Save to database ──
  const handleConfirmOrder = () => {
    if (!savedOrder) return;
    setDatabase((prev) => ({
      ...prev,
      orders: [...(prev.orders || []), savedOrder],
      // Also record as a sale for dashboard analytics
      sales: [...(prev.sales || []), {
        id: savedOrder.id,
        date: savedOrder.date.slice(0, 10),
        amount: savedOrder.grandTotal,
        product: savedOrder.items[0]?.name || 'Order',
        quantity: savedOrder.items.reduce((s, i) => s + i.qty, 0),
        gst: savedOrder.gst,
      }]
    }));
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowBill(false);
      clearCart();
      setSavedOrder(null);
    }, 2000);
  };

  const filteredMenu = selectedCat === 'All'
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCat);

  return (
    <div style={styles.root}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}><Receipt size={22} style={{ marginRight: 8 }} />Billing & POS</h1>
          <p style={styles.pageSub}>
            Create customer orders and generate bills
            {menuLoading
              ? ' · Loading menu from Firebase...'
              : ` · ${menuItems.length} items available`}
          </p>
        </div>
        {cartCount > 0 && (
          <div style={styles.cartBadge}>
            <ShoppingCart size={16} /> {cartCount} item{cartCount !== 1 ? 's' : ''} · ₹{grandTotal}
          </div>
        )}
      </div>

      <div style={styles.layout}>
        {/* ── LEFT: Menu ── */}
        <div style={styles.menuPanel}>
          {/* Customer Info */}
          <div style={styles.card}>
            <p style={styles.cardLabel}>Customer Details (Optional)</p>
            <div style={styles.infoRow}>
              <input
                id="billing-customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                style={styles.input}
              />
              <input
                id="billing-table-no"
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                placeholder="Table No."
                style={{ ...styles.input, maxWidth: '110px' }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div style={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-btn-${cat.toLowerCase()}`}
                onClick={() => setSelectedCat(cat)}
                style={{
                  ...styles.catBtn,
                  ...(selectedCat === cat ? styles.catBtnActive : {})
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div style={styles.menuGrid}>
            {menuLoading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Loading menu from Firebase...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.88rem' }}>
                No items in this category. Ask the owner to add menu items.
              </div>
            ) : filteredMenu.map((item) => {
              const inCart = cart.find((c) => c.firestoreId === item.firestoreId);
              return (
                <button
                  key={item.firestoreId}
                  onClick={() => addToCart(item)}
                  style={{
                    ...styles.menuCard,
                    ...(inCart ? styles.menuCardActive : {})
                  }}
                >
                  <span style={styles.menuEmoji}>{item.emoji}</span>
                  <span style={styles.menuName}>{item.name}</span>
                  <span style={styles.menuPrice}>₹{item.price}</span>
                  {inCart && (
                    <span style={styles.menuBadge}>{inCart.qty}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div style={styles.cartPanel}>
          <div style={styles.card}>
            <div style={styles.cartHeader}>
              <p style={styles.cardLabel}><ShoppingCart size={15} style={{ marginRight: 5 }} />Current Order</p>
              {cart.length > 0 && (
                <button onClick={clearCart} style={styles.clearBtn}>
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <Coffee size={36} style={{ color: '#334155', marginBottom: 8 }} />
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No items added yet.<br />Click menu items to add.</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div style={styles.cartList}>
                  {cart.map((c) => (
                    <div key={c.id} style={styles.cartItem}>
                      <div style={styles.cartItemInfo}>
                        <span style={styles.cartItemName}>{c.emoji} {c.name}</span>
                        <span style={styles.cartItemPrice}>₹{c.price} each</span>
                      </div>
                      <div style={styles.cartItemControls}>
                        <button onClick={() => changeQty(c.id, -1)} style={styles.qtyBtn}><Minus size={12} /></button>
                        <span style={styles.qtyNum}>{c.qty}</span>
                        <button onClick={() => changeQty(c.id, +1)} style={styles.qtyBtn}><Plus size={12} /></button>
                        <button onClick={() => removeFromCart(c.id)} style={styles.removeBtn}><X size={12} /></button>
                      </div>
                      <div style={styles.cartItemTotal}>₹{c.price * c.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={styles.totalsBox}>
                  <div style={styles.totalRow}>
                    <span>Subtotal</span><span>₹{subtotal}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span>GST (5%)</span><span>₹{gst}</span>
                  </div>
                  <div style={{ ...styles.totalRow, ...styles.grandTotalRow }}>
                    <span>Grand Total</span><span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Generate Bill Button */}
                <button
                  id="generate-bill-btn"
                  onClick={handleGenerateBill}
                  style={styles.generateBtn}
                >
                  <Receipt size={17} /> Generate Bill
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bill Modal ── */}
      {showBill && savedOrder && (
        <div style={styles.modalOverlay} onClick={() => !success && setShowBill(false)}>
          <div style={styles.billModal} onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div style={styles.successBox}>
                <CheckCircle size={48} color="#34d399" />
                <p style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 700, marginTop: 12 }}>
                  Order Saved Successfully!
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Bill recorded in owner's Orders tab.</p>
              </div>
            ) : (
              <>
                {/* Bill Header */}
                <div style={styles.billHeader}>
                  <div style={styles.billShopName}>☕ Brewtopia Cafe</div>
                  <div style={styles.billMeta}>Customer Bill / Receipt</div>
                  <div style={styles.billMeta}>
                    {new Date(savedOrder.date).toLocaleString('en-IN')}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: 6 }}>
                    <span style={styles.billMeta}>Customer: <b style={{ color: '#f1f5f9' }}>{savedOrder.customerName}</b></span>
                    <span style={styles.billMeta}>Table: <b style={{ color: '#f1f5f9' }}>{savedOrder.tableNo}</b></span>
                  </div>
                </div>

                {/* Bill Items Table */}
                <div style={styles.billTableWrap}>
                  <table style={styles.billTable}>
                    <thead>
                      <tr>
                        <th style={styles.billTh}>Item</th>
                        <th style={styles.billTh}>Qty</th>
                        <th style={styles.billTh}>Rate</th>
                        <th style={styles.billTh}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedOrder.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={styles.billTd}>{item.name}</td>
                          <td style={{ ...styles.billTd, textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ ...styles.billTd, textAlign: 'right' }}>₹{item.price}</td>
                          <td style={{ ...styles.billTd, textAlign: 'right' }}>₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill Totals */}
                <div style={styles.billTotals}>
                  <div style={styles.billTotalRow}><span>Subtotal</span><span>₹{savedOrder.subtotal}</span></div>
                  <div style={styles.billTotalRow}><span>GST (5%)</span><span>₹{savedOrder.gst}</span></div>
                  <div style={{ ...styles.billTotalRow, ...styles.billGrand }}>
                    <span>TOTAL</span><span>₹{savedOrder.grandTotal}</span>
                  </div>
                  <div style={{ ...styles.billTotalRow, marginTop: 6 }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Cashier: {savedOrder.cashier}</span>
                    <span style={{ background: '#34d39920', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20 }}>✓ PAID</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={() => setShowBill(false)} style={styles.cancelBillBtn}>
                    ✕ Cancel
                  </button>
                  <button id="confirm-order-btn" onClick={handleConfirmOrder} style={styles.confirmBtn}>
                    <CheckCircle size={16} /> Confirm & Save Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        #generate-bill-btn:hover { background: linear-gradient(135deg,#059669,#10b981); transform:translateY(-1px); }
        #confirm-order-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(52,211,153,0.4); }
      `}</style>
    </div>
  );
}

// ── Styles ──
const styles = {
  root: { padding: '1.5rem', fontFamily: "'Inter','Outfit',sans-serif", animation: 'fadeInUp 0.3s ease' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  pageTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', margin: 0 },
  pageSub: { color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 30px' },
  cartBadge: { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', padding: '0.45rem 1rem', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem', alignItems: 'start' },
  menuPanel: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  cartPanel: { position: 'sticky', top: '1rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.1rem' },
  cardLabel: { fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center' },
  infoRow: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.55rem 0.85rem', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none' },
  catRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  catBtn: { padding: '0.4rem 1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  catBtnActive: { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', borderColor: 'transparent' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem' },
  menuCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', color: '#f1f5f9' },
  menuCardActive: { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.4)' },
  menuEmoji: { fontSize: '1.75rem' },
  menuName: { fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', color: '#e2e8f0' },
  menuPrice: { fontSize: '0.85rem', fontWeight: 800, color: '#a78bfa' },
  menuBadge: { position: 'absolute', top: 6, right: 8, background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  emptyCart: { textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cartList: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', maxHeight: 280, overflowY: 'auto' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, flexWrap: 'wrap' },
  cartItemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  cartItemName: { fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' },
  cartItemPrice: { fontSize: '0.7rem', color: '#64748b' },
  cartItemControls: { display: 'flex', alignItems: 'center', gap: 4 },
  qtyBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e2e8f0' },
  qtyNum: { fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', minWidth: 20, textAlign: 'center' },
  removeBtn: { background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171', marginLeft: 2 },
  cartItemTotal: { fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', minWidth: 48, textAlign: 'right' },
  totalsBox: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' },
  grandTotalRow: { fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem' },
  generateBtn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#047857,#059669)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' },
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  billModal: { background: 'linear-gradient(145deg,#1e1b4b,#0f172a)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeInUp 0.3s ease' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' },
  billHeader: { textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' },
  billShopName: { fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 },
  billMeta: { fontSize: '0.78rem', color: '#94a3b8' },
  billTableWrap: { overflowX: 'auto', marginBottom: '0.75rem' },
  billTable: { width: '100%', borderCollapse: 'collapse' },
  billTh: { textAlign: 'left', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  billTd: { fontSize: '0.85rem', color: '#e2e8f0', padding: '0.55rem 0.5rem' },
  billTotals: { borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  billTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' },
  billGrand: { fontWeight: 800, fontSize: '1.1rem', color: '#a78bfa', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem' },
  cancelBillBtn: { flex: 1, padding: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 },
  confirmBtn: { flex: 2, padding: '0.7rem', background: 'linear-gradient(135deg,#059669,#34d399)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' },
};
