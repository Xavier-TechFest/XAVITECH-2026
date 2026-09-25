"use client";

import { useState } from "react";
import { EventItem } from "@/lib/eventsData";
import Link from "next/link";
import { motion } from "framer-motion";

interface RegistrationFormProps {
  event: EventItem;
}

export default function RegistrationForm({ event }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    phone: "",
    pincode: "",
    caReferral: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.pincode) {
      alert("Please fill in all required fields.");
      return;
    }
    const randomId = `YNT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setRegId(randomId);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center">
      {/* Main Registration Scroll Container */}
      <div className="relative w-full max-w-2xl">
        {/* Metallic Top Handle Roll */}
        <div className="h-6 w-full rounded-t-2xl bg-gradient-to-r from-yellow-500 via-blue-600 to-yellow-500 shadow-md border-b border-amber-300 flex items-center justify-between px-6">
          <div className="h-2 w-12 rounded-full bg-amber-200/60" />
          <div className="h-2 w-12 rounded-full bg-amber-200/60" />
        </div>

        {/* Scroll Body Form */}
        <div className="border-x border-b border-blue-500/50 bg-[#09152e]/95 backdrop-blur-xl p-6 sm:p-10 rounded-b-2xl shadow-[0_0_60px_rgba(37,99,235,0.4)]">
          {/* Back button & Header */}
          <div className="mb-6">
            <Link
              href="/tracks"
              className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 hover:text-cyan-300 transition-colors mb-3"
            >
              <span>← Back to Events Directory</span>
            </Link>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Registration for <span className="text-cyan-400 uppercase">{event.name}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-200/70 font-mono">
              {event.fullTitle} — Fill your details to complete registration
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* FULL NAME */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Adarsh Sinha"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white placeholder-blue-300/30 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="study.adarshsinha@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white placeholder-blue-300/30 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* GENDER */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    GENDER
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white placeholder-blue-300/30 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* PINCODE */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    PINCODE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="800001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white placeholder-blue-300/30 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {/* CA REFERRAL (OPTIONAL) */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                    CA REFERRAL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CA-PATNA-2026"
                    value={formData.caReferral}
                    onChange={(e) => setFormData({ ...formData, caReferral: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/80 bg-[#070e20] p-3 text-sm text-white placeholder-blue-300/30 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Event summary info banner inside registration form */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4 font-mono text-xs text-blue-200 flex flex-wrap justify-between gap-2">
                <div>
                  <span className="text-cyan-400 font-bold block">VENUE</span>
                  <span>{event.venue}</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold block">DATE & TIME</span>
                  <span>{event.date} ({event.time})</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold block">PRIZE</span>
                  <span className="text-amber-300 font-bold">{event.prize}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 p-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(53,224,201,0.7)] active:scale-[0.99]"
              >
                SUBMIT REGISTRATION
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 mb-4 text-2xl">
                ✓
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Registration Confirmed!
              </h2>
              <p className="mt-2 text-sm text-blue-200/80">
                You are successfully registered for <span className="font-semibold text-cyan-300">{event.name}</span> ({event.fullTitle}).
              </p>

              {/* Ticket Pass Preview */}
              <div className="my-6 rounded-2xl border border-cyan-500/60 bg-[#060e22] p-6 text-left shadow-2xl font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
                  <span className="text-cyan-400 font-bold text-sm">YANTRA 2026 DIGITAL PASS</span>
                  <span className="text-amber-400 font-bold">{regId}</span>
                </div>
                <div>
                  <span className="text-blue-400/70 block">PARTICIPANT</span>
                  <span className="text-white text-sm font-bold">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-blue-400/70 block">EMAIL</span>
                  <span className="text-white">{formData.email}</span>
                </div>
                <div>
                  <span className="text-blue-400/70 block">VENUE & TIME</span>
                  <span className="text-white">{event.venue} — {event.date} ({event.time})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/tracks"
                  className="rounded-xl border border-cyan-500/60 bg-blue-900/30 px-6 py-3 font-mono text-xs font-semibold text-cyan-200 hover:bg-cyan-800/40 transition-colors"
                >
                  Explore More Arenas
                </Link>
                <button
                  type="button"
                  onClick={() => alert(`Digital Pass ID: ${regId} copied to clipboard!`)}
                  className="rounded-xl bg-cyan-500 px-6 py-3 font-mono text-xs font-bold text-bg hover:bg-cyan-400 transition-colors"
                >
                  Copy Digital Pass ID
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Metallic Bottom Handle Roll */}
        <div className="h-6 w-full rounded-b-2xl bg-gradient-to-r from-yellow-500 via-blue-600 to-yellow-500 shadow-md border-t border-amber-300 flex items-center justify-between px-6">
          <div className="h-2 w-12 rounded-full bg-amber-200/60" />
          <div className="h-2 w-12 rounded-full bg-amber-200/60" />
        </div>
      </div>
    </div>
  );
}
