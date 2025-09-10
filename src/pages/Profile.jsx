// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, updateProfile } = useAuth();   // no Navigate
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    currentPassword: "", newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
      }));
    }
  }, [user]);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    if (form.newPassword && form.newPassword.length < 6) return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Please fill required fields");
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      toast.success("Profile updated!");
      setForm(f => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 No redirect: show a login prompt card instead
  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white/80 p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Profile</h1>
        <p className="text-gray-700">Please log in to view and edit your profile.</p>
        <a
          href="/login"
          className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto grid max-w-3xl gap-6"
    >
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            user.name || user.email || "User"
          )}`}
          alt="Avatar"
          className="h-14 w-14 rounded-2xl ring-2 ring-white/40"
        />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">My Profile</h1>
          <p className="truncate text-white/80 text-sm">{user.email}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-emerald-300/40 bg-white/80 p-6 shadow">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-emerald-900">Full name</label>
            <input
              name="name" value={form.name} onChange={onChange} required
              className="w-full rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-emerald-900">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={onChange} required
              className="w-full rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">Phone</label>
            <input
              name="phone" value={form.phone} onChange={onChange}
              className="w-full rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="+972-5x-xxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">Address</label>
            <input
              name="address" value={form.address} onChange={onChange}
              className="w-full rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="City, Street, No."
            />
          </div>
        </div>

        <details className="rounded-xl border border-emerald-300/50 p-4 open:bg-white/50">
          <summary className="cursor-pointer text-sm font-medium text-emerald-900">Change password (optional)</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="password" name="currentPassword" value={form.currentPassword} onChange={onChange}
              placeholder="Current password"
              className="rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <input
              type="password" name="newPassword" value={form.newPassword} onChange={onChange}
              placeholder="New password (min 6)"
              className="rounded-xl border border-emerald-300/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </details>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="submit" disabled={saving || !canSubmit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
