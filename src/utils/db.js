/**
 * db.js — Firestore service layer
 * All database read/write operations go through here.
 * Collections: sales | inventory | orders | expenses
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Collection references ──
export const salesCol     = collection(db, "sales");
export const inventoryCol = collection(db, "inventory");
export const ordersCol    = collection(db, "orders");
export const expensesCol  = collection(db, "expenses");
export const menuCol      = collection(db, "menuItems");

// ════════════════════════════════════════
//  SALES
// ════════════════════════════════════════
export const getSales = async () => {
  const snap = await getDocs(query(salesCol, orderBy("date", "asc")));
  return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
};

export const addSale = async (sale) => {
  return await addDoc(salesCol, { ...sale, createdAt: serverTimestamp() });
};

export const listenSales = (callback) => {
  return onSnapshot(query(salesCol, orderBy("date", "asc")), (snap) => {
    callback(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
};

// ════════════════════════════════════════
//  INVENTORY
// ════════════════════════════════════════
export const getInventory = async () => {
  const snap = await getDocs(inventoryCol);
  return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
};

export const updateInventoryItem = async (firestoreId, data) => {
  return await updateDoc(doc(db, "inventory", firestoreId), data);
};

export const addInventoryItem = async (item) => {
  return await addDoc(inventoryCol, { ...item, createdAt: serverTimestamp() });
};

export const deleteInventoryItem = async (firestoreId) => {
  return await deleteDoc(doc(db, "inventory", firestoreId));
};

export const listenInventory = (callback) => {
  return onSnapshot(inventoryCol, (snap) => {
    callback(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
};

// ════════════════════════════════════════
//  ORDERS (Cashier Bills)
// ════════════════════════════════════════
export const getOrders = async () => {
  const snap = await getDocs(query(ordersCol, orderBy("date", "desc")));
  return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
};

export const addOrder = async (order) => {
  return await addDoc(ordersCol, { ...order, createdAt: serverTimestamp() });
};

export const deleteOrder = async (firestoreId) => {
  return await deleteDoc(doc(db, "orders", firestoreId));
};

export const listenOrders = (callback) => {
  return onSnapshot(query(ordersCol, orderBy("date", "desc")), (snap) => {
    callback(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
};

// ════════════════════════════════════════
//  EXPENSES
// ════════════════════════════════════════
export const getExpenses = async () => {
  const snap = await getDocs(query(expensesCol, orderBy("date", "asc")));
  return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
};

export const addExpense = async (expense) => {
  return await addDoc(expensesCol, { ...expense, createdAt: serverTimestamp() });
};

export const deleteExpense = async (firestoreId) => {
  return await deleteDoc(doc(db, "expenses", firestoreId));
};

export const listenExpenses = (callback) => {
  return onSnapshot(query(expensesCol, orderBy("date", "asc")), (snap) => {
    callback(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
};

// ════════════════════════════════════════
//  MENU ITEMS
// ════════════════════════════════════════
export const listenMenuItems = (callback) => {
  return onSnapshot(query(menuCol, orderBy("name", "asc")), (snap) => {
    callback(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
  });
};

export const addMenuItem = async (item) => {
  return await addDoc(menuCol, { ...item, createdAt: serverTimestamp() });
};

export const updateMenuItem = async (firestoreId, data) => {
  return await updateDoc(doc(db, "menuItems", firestoreId), data);
};

export const deleteMenuItem = async (firestoreId) => {
  return await deleteDoc(doc(db, "menuItems", firestoreId));
};

export const checkMenuSeeded = async () => {
  const snap = await getDocs(menuCol);
  return !snap.empty;
};

// ════════════════════════════════════════
//  SEED — Upload Kaggle-style dataset once
// ════════════════════════════════════════
export const checkIfSeeded = async () => {
  const snap = await getDocs(salesCol);
  return !snap.empty;
};

export const seedDatabase = async (seedData) => {
  const batch = writeBatch(db);

  // Seed sales
  (seedData.sales || []).forEach((item) => {
    const ref = doc(salesCol);
    batch.set(ref, item);
  });

  // Seed inventory
  (seedData.inventory || []).forEach((item) => {
    const ref = doc(inventoryCol);
    batch.set(ref, item);
  });

  // Seed expenses
  (seedData.expenses || []).forEach((item) => {
    const ref = doc(expensesCol);
    batch.set(ref, item);
  });

  // Seed menu items
  (seedData.menuItems || []).forEach((item) => {
    const ref = doc(menuCol);
    batch.set(ref, item);
  });

  await batch.commit();
};
