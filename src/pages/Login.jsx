// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-md backdrop-blur"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-emerald-900/80">Login to continue</p>

        {err && (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="rounded-xl border border-emerald-300 bg-white/90 px-4 py-2 text-gray-800 shadow-sm transition
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/70"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="rounded-xl border border-emerald-300 bg-white/90 px-4 py-2 text-gray-800 shadow-sm transition
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition
                       hover:bg-emerald-700 active:bg-emerald-800
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
                       disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-700">
          No account?{" "}
          <Link
            to="/signup"
            className="font-medium text-emerald-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
