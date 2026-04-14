"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="grid min-h-[45vh] place-items-center px-6 py-10">
      <div className="grid place-items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-700"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <p className="text-sm font-medium text-slate-700">Loading page...</p>
      </div>
    </div>
  );
}
