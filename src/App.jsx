import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Products from "./pages/products.jsx";
import Cart from "./pages/Cart.jsx";
import Product from "./pages/product.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx"
import Profile from "./pages/Profile.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

// ---------- Nav items ----------
const navItems = [
  { to: "/", label: "Home" },
  {to: "/Products", label: "Products"},
  { to: "/cart", label: "Cart" },
  { to: "/my-orders", label: "My Orders" },
  {to: "/profilo",label: "Profile"}
];

// ---------- Animated NavLink with gradient header support ----------
function AnimatedLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative px-3 py-2 rounded-xl transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
          isActive ? "text-white" : "text-emerald-50/80 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10 text-sm font-medium">{children}</span>
          {isActive && (
            <motion.span
              layoutId="active-pill"
              className="absolute inset-0 rounded-xl bg-emerald-300/30 shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// ---------- User menu ----------
function UserMenu() {
  const { user, logout } = useAuth();

  // Logged out: show Login / Signup
  if (!user) {
    return (
      <div className="hidden sm:flex gap-2">
        <AnimatedLink to="/login">Login</AnimatedLink>
        <AnimatedLink to="/signup">Signup</AnimatedLink>
      </div>
    );
  }

  // Logged in: inline greeting + Logout button
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/90">Hi, {user.name}</span>
      <button
        onClick={logout}
        className="rounded-xl bg-emerald-200/20 px-3 py-1.5 text-sm text-white
                   hover:bg-emerald-200/30 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        Logout
      </button>
    </div>
  );
}


// ---------- Mobile menu (hamburger → X) ----------
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const baseItems = user
    ? navItems
    : navItems.filter((n) => n.to !== "/my-orders" && n.to !== "/profilo");

  const menuItems = user
    ? baseItems
    : [
        ...baseItems,
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Signup" },
      ];

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl bg-emerald-200/20 p-2 text-white hover:bg-emerald-200/30"
        aria-label="Toggle navigation"
      >
        <div className="relative h-4 w-5">
          <motion.span
            className="absolute left-0 top-0 block h-0.5 w-5 bg-white"
            animate={{ y: open ? 6 : 0, rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
          <motion.span
            className="absolute left-0 top-1.5 block h-0.5 w-5 bg-white"
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="absolute left-0 bottom-0 block h-0.5 w-5 bg-white"
            animate={{ y: open ? -6 : 0, rotate: open ? -45 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden rounded-2xl border border-emerald-200/30 bg-emerald-900/80 p-4 text-white backdrop-blur"
          >
            <div className="flex flex-col gap-3">
              {menuItems.map((n) => (
                <AnimatedLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                >
                  <span className="block w-full rounded-lg bg-emerald-700/40 px-3 py-2 text-center text-base hover:bg-emerald-600/60">
                    {n.label}
                  </span>
                </AnimatedLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}


// ---------- Header (emerald gradient) ----------
function Header() {
  const { items = [] } = useCart();
  const count = items.reduce((acc, it) => acc + (it.qty || 1), 0);
  const { user } = useAuth();    
  const items2 = user ? navItems                        // ✅ filter the list
                     : navItems.filter(n => n.to !== "/my-orders" && n.to!=="/profilo");
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="sticky top-0 z-20 border-b border-emerald-300/40 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <motion.img
            src="assets/download.png"
            alt="Shop Logo"
            initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="h-12 w-12 rounded-2xl object-cover shadow-md ring-1 ring-emerald-200"
          />
          <div className="text-xl font-bold tracking-tight">NovaStore</div>
        </div>

        <LayoutGroup>
          <nav className="hidden gap-2 sm:flex">
            {items2.map((n) => (
            <AnimatedLink key={n.to} to={n.to}>
              {n.label}
              {n.to === "/cart" && (
                <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </AnimatedLink>
          ))}
          </nav>
        </LayoutGroup>

        <div className="flex items-center gap-3">
          <UserMenu />
          <MobileMenu />
        </div>
      </div>
    </motion.header>
  );
}

// ---------- Page transition wrapper ----------
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-6xl px-4 py-6"
    >
      {children}
    </motion.div>
  );
}

// ---------- App ----------
export default function App() {
  const location = useLocation();
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{ duration: 1800 }} />
        <div className="min-h-screen bg-gradient-to-br from-emerald-200 via-teal-400 to-cyan-600 text-gray-900">
          <Header />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />
              <Route
                path="/cart"
                element={
                  <PageTransition>
                    <Cart />
                  </PageTransition>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <PageTransition>
                    <Product />
                  </PageTransition>
                }
              />
              <Route
                path="/order-success/:id"
                element={
                  <PageTransition>
                    <OrderSuccess />
                  </PageTransition>
                }
              />
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                }
              />
              <Route
                path="/signup"
                element={
                  <PageTransition>
                    <Signup />
                  </PageTransition>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <PageTransition>
                    <MyOrders />
                  </PageTransition>
                }
              />
               <Route
                path="/Products"
                element={
                  <PageTransition>
                    <Products />
                  </PageTransition>
                }
              />
               <Route
                path="/profilo"
                element={
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                }
              />
               <Route
                path="/Checkout"
                element={
                  <PageTransition>
                    <Checkout />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

/*
Fresh green theme applied:
- App background uses emerald→teal→cyan gradient.
- Header uses matching emerald/teal/cyan gradient.
- Nav active pill is emerald tinted.
- User menu + mobile nav use emerald semi-transparent backgrounds.
- Buttons and hover states consistent with green theme.
*/
