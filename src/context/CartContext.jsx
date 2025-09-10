// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  // ✅ Load once, synchronously, from localStorage (no effect → no race)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ✅ Persist on change (idempotent even in Strict Mode)
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items]);

 // src/context/CartContext.jsx (only the add() function)
const add = (p, qty = 1) => {
  setItems((prev) => {
    const i = prev.findIndex((x) => x.productId === p.id);
    if (i > -1) {
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    }
    return [
      ...prev,
      {
        productId: p.id,
        title: p.title,
        price: p.price,
        qty,
        image: p.image,  // store for cart preview
        desc: p.desc,    // store for cart preview
      },
    ];
  });
};


  const setQty = (productId, qty) =>
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)));

  const remove = (productId) => setItems(prev => prev.filter(i => i.productId !== productId));
  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, add, setQty, remove, clear, total }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
