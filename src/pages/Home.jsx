// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const HERO_IMAGES = [
  "https://th.bing.com/th/id/OIF.4r6aMVPQBlyyZH9s6IKGzw?w=324&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1400&auto=format&fit=crop",
];

const CATEGORIES = [
  { label: "Phones", cat: "phones", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop" },
  { label: "Laptops", cat: "laptops", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop" },
  { label: "Accessories", cat: "accessories", img: "https://img.joomcdn.net/92a604ee91a5ba6b8781ea09ce05eeb7036a8338_1024_1024.jpeg" },
  { label: "Cameras", cat: "cameras", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80" },
  { label: "Monitors", cat: "monitors", img: "https://th.bing.com/th/id/OIP.Puint7-0ws-20OhCdk-ogwHaE8?w=290&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" },
  { label: "Tablets", cat: "tablets", img: "https://tse1.mm.bing.net/th/id/OIP.7uEIkRJb_dI3du1LwNrVkAHaG9?rs=1&pid=ImgDetMain&o=7&rm=3" },
];

// --- Contact box (emails via /api/contact + WhatsApp quick chat) ---
function ContactBox() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    company: "", // honeypot
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSent(false);
    try {
      await axios.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "", company: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm backdrop-blur">
      <h2 className="text-lg font-semibold text-emerald-800">Contact us</h2>

      {sent && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
          Thanks! We received your message and will reply by email.
        </div>
      )}

      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* Honeypot */}
        <input
          name="company"
          value={form.company}
          onChange={onChange}
          className="hidden"
          autoComplete="off"
          tabIndex={-1}
        />

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Your name"
          required
          className="rounded-xl border border-emerald-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Your email"
          required
          className="rounded-xl border border-emerald-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="Phone (optional)"
          className="rounded-xl border border-emerald-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          placeholder="How can we help?"
          rows={4}
          required
          className="sm:col-span-2 rounded-xl border border-emerald-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
        />

        <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>

          {/* Replace 972501234567 with your real WhatsApp number (countrycode + number, no +, no dashes) */}
          <a
            href="https://wa.me/+972549598571?text=Hi%20NovaStore!%20I%20have%20a%20question%20🙂"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white/80 px-4 py-2 font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
              <path d="M20.52 3.48A11.78 11.78 0 0012.06 0C5.74 0 .6 5.14.6 11.47c0 2.02.53 4 .15 5.86L0 24l6.84-1.79c1.74.47 3.5.7 5.23.7 6.32 0 11.46-5.14 11.46-11.47 0-3.06-1.19-5.94-3.01-7.96zM12.07 21c-1.6 0-3.19-.28-4.7-.81l-.34-.12-4.05 1.06 1.09-3.95-.12-.35a9.35 9.35 0 01-.7-3.36C3.25 6.8 7.47 2.58 12.07 2.58c2.35 0 4.56.92 6.22 2.58a8.73 8.73 0 012.57 6.22c0 4.6-4.22 8.62-8.79 9.62z"/>
              <path d="M17.47 14.2c-.27-.14-1.57-.77-1.8-.86-.24-.09-.41-.14-.58.14-.17.27-.66.86-.81 1.03-.15.17-.3.2-.56.07-.27-.14-1.12-.41-2.14-1.31-.79-.7-1.32-1.56-1.48-1.82-.15-.27-.02-.42.11-.56.12-.12.27-.32.41-.48.14-.17.18-.27.27-.45.09-.17.05-.34-.02-.48-.07-.14-.58-1.4-.79-1.91-.21-.5-.42-.43-.58-.44h-.5c-.17 0-.45.07-.68.34-.23.27-.89.86-.89 2.1 0 1.24.9 2.44 1.02 2.61.12.17 1.77 2.71 4.28 3.79 1.51.65 2.1.71 2.85.6.46-.07 1.4-.57 1.6-1.12.2-.54.2-1.01.14-1.12-.06-.11-.22-.17-.49-.3z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // data
  const [products, setProducts] = useState([]);
  useEffect(() => { axios.get("/products").then(res => setProducts(res.data)); }, []);

  // hero rotator
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  // search + dropdown state
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products
      .filter(p =>
        (p.title + " " + p.desc + " " + (p.cat || "")).toLowerCase().includes(needle)
      )
      .slice(0, 20);
  }, [products, q]);

  const showPanel = focused && q.trim().length > 0;

  // click outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setFocused(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) {
        navigate(`/product/${results[active].id}`);
        setFocused(false);
      } else {
        navigate(`/products?q=${encodeURIComponent(q)}`);
        setFocused(false);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      setActive(-1);
    }
  };

  // Top products
  const top = useMemo(() => [...products].sort((a,b)=>b.price-a.price).slice(0,8), [products]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* HERO */}
      <section className="relative rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white shadow-lg">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIdx}
              src={HERO_IMAGES[heroIdx]}
              alt=""
              className="h-full w-full object-cover opacity-70"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.2, scale: 1.03 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>
        </div>

        <div className="relative z-10 grid gap-4 px-6 py-10 sm:grid-cols-2 sm:items-center sm:gap-8 sm:px-10">
          {/* Hero text */}
          <div>
            <motion.h1
              className="uppercase font-extrabold tracking-[0.08em] text-4xl sm:text-5xl"
              style={{ WebkitTextStroke: "1.5px rgba(17,24,39,.45)" }}
              animate={{
                textShadow: [
                  "0 0 8px rgba(251,191,36,.55), 0 0 20px rgba(253,164,175,.45), 0 0 36px rgba(244,114,182,.35)",
                  "0 0 16px rgba(251,191,36,.8), 0 0 36px rgba(253,164,175,.6), 0 0 60px rgba(244,114,182,.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                WELCOME TO NOVASTORE
              </span>
            </motion.h1>

            <motion.p
              className="mt-2 font-extrabold tracking-wide text-2xl sm:text-3xl"
              style={{ WebkitTextStroke: "1px rgba(17,24,39,.35)" }}
              animate={{
                textShadow: [
                  "0 0 6px rgba(251,191,36,.55), 0 0 14px rgba(244,114,182,.45)",
                  "0 0 12px rgba(251,191,36,.8), 0 0 28px rgba(244,114,182,.6)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.15 }}
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Fresh Tech, Sharp Prices
              </span>
            </motion.p>
          </div>

          {/* Search with typeahead */}
          <div className="sm:justify-self-end w-full max-w-md">
            <div ref={boxRef} className="relative">
              <div className="rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/70">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                  <input
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setActive(-1); }}
                    onFocus={() => setFocused(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search products…"
                    className="w-full rounded-xl border border-emerald-200/70 pl-10 pr-3 py-3 text-emerald-900 outline-none
                               focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              </div>

              <AnimatePresence>
                {showPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl"
                  >
                    {results.length === 0 ? (
                      <div className="p-4 text-sm text-emerald-900/80">No results for “{q}”.</div>
                    ) : (
                      <>
                        <ul className="max-h-80 overflow-y-auto divide-y divide-emerald-100">
                          {results.map((p, idx) => (
                            <li key={p.id}>
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { navigate(`/product/${p.id}`); setFocused(false); }}
                                onMouseEnter={() => setActive(idx)}
                                className={`grid w-full grid-cols-[56px_1fr] items-center gap-3 p-2 text-left transition
                                  ${active === idx ? "bg-emerald-50" : "hover:bg-emerald-50"}`}
                              >
                                <img
                                  src={p.image}
                                  onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                  alt={p.title}
                                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-emerald-100"
                                />
                                <div className="min-w-0">
                                  <div className="line-clamp-1 font-medium text-gray-900">{p.title}</div>
                                  <div className="mt-0.5 line-clamp-1 text-xs text-gray-600">{p.desc}</div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center justify-between bg-emerald-50/40 p-2">
                          <span className="px-1 text-xs text-gray-500">
                            {results.length} result{results.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-emerald-800">Shop by category</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.cat}
              onClick={() => navigate(`/products?cat=${encodeURIComponent(c.cat)}`)}
              className="group flex flex-col items-center"
            >
              <div className="h-24 w-24 overflow-hidden rounded-3xl ring-2 ring-emerald-200 transition group-hover:ring-emerald-400">
                <img src={c.img} alt={c.label} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <span className="mt-2 text-sm font-medium text-emerald-900/90">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TOP PRODUCTS */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-800">Top products</h2>
          <button
            onClick={() => navigate("/products")}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            see all products →
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {top.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <img
                src={p.image}
                alt={p.title}
                onError={(e)=>e.currentTarget.src="/images/placeholder.jpg"}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="p-3">
                <div className="line-clamp-2 text-sm font-semibold text-gray-900">{p.title}</div>
                <div className="mt-1 text-xs text-emerald-700">₪{p.price.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ABOUT (real-store style) */}
      <section className="mt-12">
        <div className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-emerald-800">About NovaStore</h2>

          <p className="mt-2 text-emerald-900/85">
            NovaStore is a specialty electronics retailer. We keep a focused catalog, verify specs,
            and work with reputable distributors so you get genuine products at fair prices—without
            the guesswork.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Israel-wide delivery</div>
                <div className="text-sm text-emerald-900/75">Fast, trackable shipping on all orders.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Easy returns</div>
                <div className="text-sm text-emerald-900/75">Hassle-free returns on eligible, unused items.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Local warranty</div>
                <div className="text-sm text-emerald-900/75">Official manufacturer or distributor warranty.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Secure checkout</div>
                <div className="text-sm text-emerald-900/75">Visa / Mastercard and trusted payment options.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Clear specs</div>
                <div className="text-sm text-emerald-900/75">Accurate, up-to-date product details you can trust.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/70 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Helpful support</div>
                <div className="text-sm text-emerald-900/75">Quick help by chat or email for any order question.</div>
              </div>
            </li>
          </ul>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-white/70 p-4">
              <dt className="font-medium text-emerald-900">Shipping</dt>
              <dd className="mt-1 text-sm text-emerald-900/80">
                Orders are processed quickly and shipped with tracking. You’ll receive an email
                confirmation and updates until delivery.
              </dd>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white/70 p-4">
              <dt className="font-medium text-emerald-900">Returns</dt>
              <dd className="mt-1 text-sm text-emerald-900/80">
                If something isn’t right, start a return request and we’ll guide you through the steps.
                Items must be in original condition with all packaging.
              </dd>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white/70 p-4">
              <dt className="font-medium text-emerald-900">Warranty</dt>
              <dd className="mt-1 text-sm text-emerald-900/80">
                All products include the official manufacturer or distributor warranty. We’ll help you
                with any claim if you ever need it.
              </dd>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white/70 p-4">
              <dt className="font-medium text-emerald-900">Payments & invoices</dt>
              <dd className="mt-1 text-sm text-emerald-900/80">
                Secure card payments at checkout. Need a tax invoice? Add your business details at
                checkout and we’ll issue one with your order.
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-emerald-900/85">
            Have a question about compatibility, stock or delivery? Get in touch—we’re happy to help.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="mt-8">
        <ContactBox />
      </section>
    </div>
  );
}
