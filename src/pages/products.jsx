// src/pages/Products.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const VALID_CATS = ["all", "phones", "laptops", "accessories", "cameras", "monitors", "tablets"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("relevance");
  const { add } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch
  useEffect(() => {
    axios.get("/products").then((res) => setProducts(res.data));
  }, []);

  // --- Read from URL (so /products?cat=phones pre-selects and filters) ---
  useEffect(() => {
    const qp = (searchParams.get("q") || "").trim();
    const cp = (searchParams.get("cat") || "all").trim().toLowerCase();

    if (qp !== q) setQ(qp);
    if (VALID_CATS.includes(cp) && cp !== cat) setCat(cp);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep URL in sync when user changes filters (so back/refresh/bookmark keeps them)
  const syncParams = (next = {}) => {
    const params = new URLSearchParams(searchParams);
    const updates = { q, cat, ...next };

    if (!updates.q) params.delete("q"); else params.set("q", updates.q);
    if (!updates.cat || updates.cat === "all") params.delete("cat"); else params.set("cat", updates.cat);

    setSearchParams(params, { replace: true });
  };

  // Filter & sort
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter((p) => {
      const pCat = (p.cat || "").toLowerCase();
      const matchesQ = (p.title + " " + p.desc + " " + pCat).toLowerCase().includes(needle);
      const matchesCat = cat === "all" ? true : pCat === cat;
      return matchesQ && matchesCat;
    });
    switch (sort) {
      case "price_asc":  list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "name_asc":   list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return list;
  }, [products, q, cat, sort]);

  // Animations
  const gridVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
  const cardVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 bg-clip-text text-transparent">
            Products ({filtered.length})
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{
              opacity: [0.85, 1, 0.85],
              y: [4, 0, 4],
              textShadow: [
                "0 0 0px rgba(16,185,129,0)",
                "0 0 10px rgba(16,185,129,0.7), 0 0 22px rgba(6,182,212,0.5)",
                "0 0 0px rgba(16,185,129,0)"
              ],
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm sm:text-base font-medium bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
            style={{ backgroundSize: "200% 100%" }}
          >
            Electronics you’ll actually want.
          </motion.p>
        </div>

        {/* Controls */}
        <div className="grid w-full gap-2 sm:ml-auto sm:w-auto sm:grid-cols-3">
          {/* Category */}
          <div className="relative">
            <select
              value={cat}
              onChange={(e) => { const v = e.target.value; setCat(v); syncParams({ cat: v }); }}
              className="w-full appearance-none rounded-xl border border-emerald-400 bg-white/90 px-3 py-2 pr-9
                         text-emerald-700 text-sm font-medium shadow-md transition
                         hover:border-emerald-500 hover:shadow-lg
                         focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="all">All categories</option>
              <option value="phones">Phones</option>
              <option value="laptops">Laptops</option>
              <option value="accessories">Accessories</option>
              <option value="cameras">Cameras</option>
              <option value="monitors">Monitors</option>
              <option value="tablets">Tablets</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-emerald-600">▼</span>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none rounded-xl border border-emerald-400 bg-white/90 px-3 py-2 pr-9
                         text-emerald-700 text-sm font-medium shadow-md transition
                         hover:border-emerald-500 hover:shadow-lg
                         focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/60"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-emerald-600">▼</span>
          </div>

          {/* Search */}
          <input
            value={q}
            onChange={(e) => { const val = e.target.value; setQ(val); syncParams({ q: val }); }}
            placeholder="Search electronics…"
            className="w-full min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur
                       placeholder:text-emerald-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-200/70 focus:border-emerald-300"
          />
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            variants={cardVariants}
            onClick={() => navigate(`/product/${p.id}`)}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-emerald-100/70 bg-white/70 shadow-sm backdrop-blur transition
                       hover:-translate-y-0.5 hover:shadow-lg"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/product/${p.id}`); }}
          >
            <div className="relative">
              <img
                src={p.image}
                alt={p.title}
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:aspect-square"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h3 className="line-clamp-2 text-base font-semibold text-gray-900 sm:text-lg">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">{p.desc}</p>

              <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold text-emerald-700 sm:text-base">
                  ₪{p.price.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    add(p, 1);
                    toast.success(`${p.title} added to cart!`, { icon: "🛒" });
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition
                             hover:bg-emerald-700 active:bg-emerald-800
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
