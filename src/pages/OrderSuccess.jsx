// src/pages/OrderSuccess.jsx
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="rounded-2xl border border-emerald-200/60 bg-white/80 p-8 shadow-md backdrop-blur"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
        >
          <svg
            className="h-8 w-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Order placed!
        </h1>

        <p className="mt-2 text-gray-700">
          Order ID:{" "}
          <span className="font-mono text-emerald-700">{id}</span>
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition
                     hover:bg-emerald-700 active:bg-emerald-800
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          Continue shopping
        </Link>
      </motion.div>
    </div>
  );
}
