// src/pages/Product.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// --- tiny helper to make keys look nice ---
function prettyKey(k) {
  return k
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase -> spaced
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// --- simplest specs renderer: just print whatever keys exist ---
function SpecsSimple({ specs = {} }) {
  const keys = Object.keys(specs);
  if (!keys.length) return null;

  // alphabetical for some stability; delete the .sort(...) if you prefer original order
  keys.sort((a, b) => a.localeCompare(b));

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-emerald-800">Specifications</h2>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {keys.map((k) => {
          const v = specs[k];
          const value =
            Array.isArray(v) ? v.join(", ") : v != null ? String(v) : "—";
        return (
          <div key={k} className="rounded-lg bg-emerald-50/60 p-3 ring-1 ring-emerald-100">
            <dt className="text-xs uppercase tracking-wide text-emerald-700">
              {prettyKey(k)}
            </dt>
            <dd className="text-sm text-gray-900">{value}</dd>
          </div>
        );
        })}
      </dl>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axios
      .get(`/products/${id}`)
      .then((res) => {
        if (alive) {
          setP(res.data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-emerald-900/80">
        Loading…
      </div>
    );
  if (!p)
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-emerald-900/80">
        Product not found.
      </div>
    );

  const inStock = Number(p.stock) > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm backdrop-blur"
      >
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/70 px-3 py-1.5 text-sm text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            ← Back to products
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl">
            <motion.img
              src={p.image}
              alt={p.title}
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
              initial={{ scale: 1.01 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {p.title}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-700">{p.desc}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                {p.cat}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  inStock
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-red-50 text-red-700 ring-1 ring-red-200"
                }`}
              >
                {inStock ? `In stock: ${p.stock}` : "Out of stock"}
              </span>
            </div>

            <div className="mt-5 text-2xl font-semibold text-emerald-700">
              ₪{p.price.toFixed(2)}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  add(p, 1);
                  toast.success(`${p.title} added to cart!`, { icon: "🛒" });
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition
                           hover:bg-emerald-700 active:bg-emerald-800
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Add to cart
              </button>

              <Link
                to="/cart"
                className="rounded-xl border border-emerald-300 bg-white/80 px-5 py-2.5 font-medium text-emerald-700 shadow-sm transition
                           hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Go to cart
              </Link>
            </div>

            {/* Specs - super simple */}
            <SpecsSimple specs={p.specs} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
