// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goCheckout = () => {
    if (!user) {
      // send them to login, then back to checkout afterward
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout"); // keep this lowercase to match your route
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-emerald-200/60 bg-white/70 p-6 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Cart
        </h1>
        <p className="mt-2 text-emerald-900/80">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Your Cart
        </h1>
        <button onClick={clear} className="text-sm text-emerald-700 hover:underline">
          Clear
        </button>
      </div>

      <ul className="mt-4 divide-y-2 divide-emerald-300/70">
        {items.map((it) => {
          const subtotal = (it.price * (it.qty || 1)).toFixed(2);
          return (
            <li key={it.productId} className="py-3">
              <div className="grid grid-cols-[84px_1fr_auto] gap-3 sm:grid-cols-[112px_1fr_auto] sm:gap-4 items-center">
                <Link to={`/product/${it.productId}`} className="group col-span-2 flex items-center gap-3 sm:gap-4">
                  <div className="overflow-hidden rounded-xl ring-1 ring-emerald-100/80">
                    <img
                      src={it.image || "/images/placeholder.jpg"}
                      onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                      alt={it.title}
                      className="h-20 w-20 sm:h-24 sm:w-24 object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 line-clamp-1">{it.title}</div>
                    {it.desc && <div className="mt-0.5 text-sm text-gray-600 line-clamp-2">{it.desc}</div>}
                    <div className="mt-1 text-sm text-emerald-700">
                      ₪{it.price.toFixed(2)} <span className="text-gray-500">each</span>
                    </div>
                  </div>
                </Link>

                <div className="ml-auto flex flex-col items-end gap-2">
                  <div className="flex items-center rounded-xl border border-emerald-300 bg-white/90 shadow-sm">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(it.productId, Math.max(1, (it.qty || 1) - 1))}
                      className="px-3 py-1.5 text-lg leading-none text-emerald-700 hover:bg-emerald-50 rounded-l-xl"
                    >
                      –
                    </button>

                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={it.qty}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "");
                        const n = Math.max(1, Number(cleaned || 1));
                        setQty(it.productId, n);
                      }}
                      className="w-14 text-center px-2 py-1.5 outline-none bg-transparent"
                      aria-label="Quantity"
                    />

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(it.productId, (it.qty || 1) + 1)}
                      className="px-3 py-1.5 text-lg leading-none text-emerald-700 hover:bg-emerald-50 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-emerald-800">₪{subtotal}</div>
                    <button
                      onClick={() => remove(it.productId)}
                      className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-3xl font-bold text-emerald-800">Total: ₪{total.toFixed(2)}</span>

        <button
          onClick={goCheckout}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition
                     hover:bg-emerald-700 active:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          {user ? "Checkout" : "Login to checkout"}
        </button>
      </div>
    </div>
  );
}
