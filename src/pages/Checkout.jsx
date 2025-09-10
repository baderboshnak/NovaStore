// src/pages/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { user } = useAuth();

  const [placing, setPlacing] = useState(false);
  const [method, setMethod] = useState("card"); // 'card' | 'paypal' | 'cod'
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "", // MM/YY
    cvv: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");

  

  // Simple formatters/validators (demo only)
  const formatCardNumber = (v) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const luhnValid = (num) => {
    const s = num.replace(/\s+/g, "");
    if (!s || s.length < 12) return false;
    let sum = 0, dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = Number(s[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  };

  const expiryValid = (e) => {
    const m = /^(\d{2})\/(\d{2})$/.exec(e);
    if (!m) return false;
    const mm = Number(m[1]);
    const yy = Number(m[2]);
    if (mm < 1 || mm > 12) return false;
    // assume 20YY
    const now = new Date();
    const yNow = now.getFullYear() % 100;
    const mNow = now.getMonth() + 1;
    if (yy > yNow) return true;
    if (yy < yNow) return false;
    return mm >= mNow; // same year: must be this month or later
  };

  const cardOk = useMemo(() => {
    if (method !== "card") return true;
    return (
      card.name.trim().length >= 2 &&
      luhnValid(card.number) &&
      expiryValid(card.expiry) &&
      /^\d{3,4}$/.test(card.cvv)
    );
  }, [method, card]);

  const paypalOk = useMemo(() => {
    if (method !== "paypal") return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail);
  }, [method, paypalEmail]);

  const canPay = useMemo(() => {
    if (!user) return false;
    if (method === "card") return cardOk;
    if (method === "paypal") return paypalOk;
    return true; // COD
  }, [user, method, cardOk, paypalOk]);

  

  const handlePay = async () => {
    if (!user) {
      toast.error("Please log in to complete checkout");
      return;
    }
    if (!canPay) {
      toast.error("Please fill payment details correctly");
      return;
    }

    try {
      setPlacing(true);
      

      // 2) create order (same payload your Cart used)
      // NOTE: keep the same path style your app already uses.
      const res = await axios.post("/orders", {
        items,
        total,
        userId: user.id,
        // You can also include a demo payment summary if you want (ignored by backend):
        payment: {
          method,
          last4:
            method === "card"
              ? card.number.replace(/\D/g, "").slice(-4)
              : undefined,
          paypalEmail: method === "paypal" ? paypalEmail : undefined,
        },
      });

      // 3) clear cart and go to success
      clear();
      toast.success("Payment approved !");
      navigate(`/order-success/${res.data.orderId}`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not place the order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm"
    >
      

      <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
        Checkout
      </h1>

      <div className="mt-1 text-emerald-900/80">
        Total to pay: <span className="font-semibold">₪{total.toFixed(2)}</span>
      </div>

      {/* Payment method */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { id: "card", label: "Credit/Debit Card" },
          { id: "paypal", label: "PayPal" },
          { id: "cod", label: "Cash on Delivery" },
        ].map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3
              ${
                method === opt.id
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-emerald-200/60 bg-white"
              }`}
          >
            <input
              type="radio"
              name="method"
              value={opt.id}
              checked={method === opt.id}
              onChange={() => setMethod(opt.id)}
            />
            <span className="text-emerald-900">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Method-specific inputs */}
      {method === "card" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Name on card
            </label>
            <input
              value={card.name}
              onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
              className="w-full rounded-xl border border-emerald-300/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Card number
            </label>
            <input
              inputMode="numeric"
              value={card.number}
              onChange={(e) =>
                setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
              }
              className="w-full rounded-xl border border-emerald-300/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="4242 4242 4242 4242"
            />
            {!luhnValid(card.number) && card.number.replace(/\s/g, "").length >= 12 && (
              <p className="mt-1 text-sm text-red-600">Invalid card number</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-emerald-900">
                Expiry (MM/YY)
              </label>
              <input
                inputMode="numeric"
                value={card.expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setCard((c) => ({ ...c, expiry: v }));
                }}
                className="w-full rounded-xl border border-emerald-300/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="12/27"
              />
              {card.expiry.length === 5 && !expiryValid(card.expiry) && (
                <p className="mt-1 text-sm text-red-600">Invalid expiry</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-emerald-900">
                CVV
              </label>
              <input
                inputMode="numeric"
                value={card.cvv}
                onChange={(e) =>
                  setCard((c) => ({
                    ...c,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                className="w-full rounded-xl border border-emerald-300/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="123"
              />
              {card.cvv && !/^\d{3,4}$/.test(card.cvv) && (
                <p className="mt-1 text-sm text-red-600">Invalid CVV</p>
              )}
            </div>
          </div>
        </div>
      )}

      {method === "paypal" && (
        <div className="mt-6">
          <label className="mb-1 block text-sm font-medium text-emerald-900">
            PayPal email
          </label>
          <input
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            className="w-full rounded-xl border border-emerald-300/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="you@example.com"
          />
        </div>
      )}

      {/* Action */}
      <div className="mt-8 flex items-center justify-between">
        <Link to="/cart" className="text-emerald-800 hover:underline">
          ← Back to Cart
        </Link>
        <button
          disabled={!canPay || placing}
          onClick={handlePay}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {placing ? "Processing..." : `Pay ₪${total.toFixed(2)}`}
        </button>
      </div>
    </motion.div>
  );
}
