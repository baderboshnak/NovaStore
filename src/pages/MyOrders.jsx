// src/pages/MyOrders.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ---- Company info (customize) ----
const COMPANY = {
  name: "NovaStore",
  email: "support@novastore.com",
  phone: "+972-52-893-8327",
  address: "123 Market St, Tel Aviv",
};

const currency = (n) => `₪${Number(n).toFixed(2)}`;

const paymentLabel = (p) => {
  if (!p || !p.method) return "—";
  if (p.method === "card") return `Card •••• ${p.last4 || "????"}`;
  if (p.method === "paypal") return `PayPal ${p.paypalEmail || ""}`.trim();
  if (p.method === "cod") return "Cash on Delivery";
  return p.method;
};

const StatusChip = ({ status }) => {
  const map = {
    delivered: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    created: "bg-slate-100 text-slate-700 border border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || map.created}`}
    >
      {status}
    </span>
  );
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await axios.get("/my/orders", { params: { userId: user.id } });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // For sorting newest first (server already sorts; this is a safeguard)
  const rows = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [orders]
  );

  const openInvoice = (o) => {
    setSelected(o);
    setOpen(true);
  };

  const closeInvoice = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  const downloadPDF = async () => {
    if (!selected || !invoiceRef.current) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const node = invoiceRef.current;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale image to full page width, paginate if taller than one page
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    let remaining = imgHeight;

    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    // If taller than one page, add more pages by shifting the image up
    while (remaining > pageHeight) {
      remaining -= pageHeight;
      y -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    }

    pdf.save(`invoice_${selected._id}.pdf`);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow">
        You need to log in to see your orders.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-white/70 p-6 text-emerald-800 shadow-sm backdrop-blur">
        Loading orders…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
        My Orders
      </h1>

      {rows.length === 0 ? (
        <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-white/70 p-6 text-emerald-800 shadow-sm backdrop-blur">
          You don’t have any orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-emerald-200/60 bg-white/80 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50 text-emerald-900">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
                <th>Order</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/70 text-gray-800">
              {rows.map((o) => (
                <tr key={o._id} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="font-medium text-emerald-800">#{o._id.slice(-6)}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</td>
                  <td><StatusChip status={o.status} /></td>
                  <td className="text-right font-semibold">{currency(o.total)}</td>
                  <td className="text-right">
                    <button
                      onClick={() => openInvoice(o)}
                      className="rounded-xl border border-emerald-300 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
                    >
                      View invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"
            onClick={closeInvoice}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Printable / PDF area */}
              <div ref={invoiceRef} className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-800">{COMPANY.name}</h2>
                    <div className="text-xs text-gray-600">
                      {COMPANY.address} • {COMPANY.phone} • {COMPANY.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">INVOICE</div>
                    <div className="text-xs text-gray-500">
                      #{selected._id} <br />
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>

                <hr className="my-4 border-emerald-100" />

                {/* Bill to & Order info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <div className="text-sm font-semibold text-emerald-800">Bill To</div>
                    <div className="text-sm text-gray-700">
                      {user?.name || "Customer"} <br />
                      {user?.email} <br />
                      {user?.address || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <div className="text-sm font-semibold text-emerald-800">Order Info</div>
                    <div className="text-sm text-gray-700">
                      Payment: {paymentLabel(selected.payment)} <br />
                      Status: {selected.status}
                    </div>
                  </div>
                </div>

                {/* Items (better aligned) */}
<div className="mt-5 overflow-hidden rounded-xl border border-emerald-100">
  <table className="w-full text-sm table-fixed">
    {/* 🔧 lock column widths */}
    <colgroup>
      <col className="w-[58%]" />  {/* Product */}
      <col className="w-[12%]" />  {/* Qty */}
      <col className="w-[15%]" />  {/* Price */}
      <col className="w-[15%]" />  {/* Subtotal */}
    </colgroup>

    <thead className="bg-emerald-50 text-emerald-900">
      <tr className="[&>th]:px-4 [&>th]:py-2.5">
        <th className="text-left">Product</th>
        <th className="text-right">Qty</th>
        <th className="text-right">Price</th>
        <th className="text-right">Subtotal</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-emerald-100 text-gray-800">
      {(selected.items || []).map((it, idx) => {
        const qty = Math.max(1, it.qty || 1);
        const price = Number(it.price);
        const sub = price * qty;
        return (
          <tr key={idx} className="[&>td]:px-4 [&>td]:py-2.5">
            <td className="pr-4 break-words">{it.title}</td>
            <td className="text-right tabular-nums">{qty}</td>
            <td className="text-right tabular-nums whitespace-nowrap">{currency(price)}</td>
            <td className="text-right tabular-nums font-medium whitespace-nowrap">
              {currency(sub)}
            </td>
          </tr>
        );
      })}
    </tbody>

    <tfoot>
      <tr className="[&>td]:px-4 [&>td]:py-2.5">
        <td colSpan={3} className="text-right font-semibold">Total</td>
        <td className="text-right font-bold text-emerald-700 tabular-nums whitespace-nowrap">
          {currency(selected.total)}
        </td>
      </tr>
    </tfoot>
  </table>
</div>


                {/* Footer / contacts */}
                <div className="mt-5 text-center text-xs text-gray-500">
                  Thank you for shopping at {COMPANY.name}. For support contact {COMPANY.email}.
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex items-center justify-end gap-3 border-t border-emerald-100 p-4">
                <button
                  onClick={downloadPDF}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={closeInvoice}
                  className="rounded-xl border border-emerald-300 px-4 py-2 text-emerald-800 hover:bg-emerald-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
