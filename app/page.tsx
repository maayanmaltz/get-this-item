"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Item, Photo, ContactInfo } from "@/lib/types";

const CONTACT_KEY = "gti_contact";

function loadContact(): Partial<ContactInfo> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || "{}"); }
  catch { return {}; }
}
function saveContact(c: Partial<ContactInfo>) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  item: Item | "all";
  pickupSlots: string[];
  onClose: () => void;
}

function ItemModal({ item, pickupSlots, onClose }: ModalProps) {
  const isAll = item === "all";
  const contact = loadContact();
  const [name, setName]       = useState(contact.name  || "");
  const [phone, setPhone]     = useState(contact.phone || "");
  const [email, setEmail]     = useState(contact.email || "");
  const [slot, setSlot]       = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())                       { setError("Please enter your name."); return; }
    if (!phone.trim() && !email.trim())     { setError("Please enter a phone or email."); return; }
    if (!slot && !question.trim())          { setError("Please select a pickup date or ask a question."); return; }
    setError("");
    setLoading(true);
    saveContact({ name, phone, email });
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId:   isAll ? "all" : (item as Item).id,
        itemName: isAll ? "ALL ITEMS" : (item as Item).name,
        contactName:  name,
        contactPhone: phone || undefined,
        contactEmail: email || undefined,
        pickupSlot:   slot  || undefined,
        question:     question || undefined,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: "#0e1015", border: "1px solid #1c2030" }}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {isAll ? (
              <div>
                <div className="text-2xl font-bold gradient-text mb-1">I want it ALL! 🏠</div>
                <p className="text-sm text-gray-400">We'd love to find a family to take everything.</p>
              </div>
            ) : (
              <div>
                <div className="font-bold text-lg text-white">{(item as Item).name}</div>
                <div className="text-sm mt-0.5">
                  {(item as Item).price === 0
                    ? <span className="text-green-400 font-semibold">FREE</span>
                    : <span className="accent-text font-semibold">${(item as Item).price}</span>}
                </div>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <div className="text-xl font-bold text-white mb-2">Request sent!</div>
              <p className="text-gray-400 text-sm">We'll be in touch soon. Thanks {name}!</p>
              <button onClick={onClose} className="mt-6 gradient-btn text-white font-semibold px-6 py-2.5 rounded-xl">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</div>}

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Your name *</label>
                <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                  <input className="input" placeholder="+61 4xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {pickupSlots.length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Preferred pickup date</label>
                  <div className="space-y-2">
                    {pickupSlots.map((s) => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${slot === s ? "border-rose-400 bg-rose-400" : "border-gray-600 group-hover:border-gray-400"}`}>
                          {slot === s && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="sr-only" />
                        <span className="text-sm text-gray-300">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Question or message (optional)</label>
                <textarea className="input resize-none" rows={3} placeholder="Any questions about condition, size, etc?" value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>

              <button type="submit" disabled={loading} className="gradient-btn w-full text-white font-bold py-3 rounded-xl text-base disabled:opacity-60">
                {loading ? "Sending..." : isAll ? "🏠 I want it all!" : "📦 Get this item"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.93)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-[92vw] max-h-[90vh]"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="block rounded-2xl object-contain"
            style={{ maxWidth: "92vw", maxHeight: "90vh" }}
          />
        </motion.div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

interface PhotoCardProps {
  photo: Photo;
  items: Item[];
  index: number;
  onRequest: (item: Item) => void;
  onZoom: (url: string) => void;
}

function PhotoCard({ photo, items, index, onRequest, onZoom }: PhotoCardProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
    >
      {/* Photo — clickable to zoom */}
      <div
        className="relative w-full aspect-[4/3] bg-gray-900 overflow-hidden cursor-zoom-in group"
        onClick={() => onZoom(photo.url)}
      >
        <Image
          src={photo.url}
          alt="Item photo"
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/50 rounded-full p-2.5 backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0zm0 0l2 2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 8v6M8 11h6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y" style={{ borderColor: "#242424" }}>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            {/* Price badge */}
            <div className="flex-shrink-0">
              {item.price === 0
                ? <span className="free-badge inline-block bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">FREE</span>
                : <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full accent-text" style={{border:"1px solid #fb7185"}}>${item.price}</span>}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${item.available ? "text-white" : "text-gray-500 line-through"}`}>
                {item.name}
              </span>
              {!item.available && <span className="ml-2 text-xs text-gray-600">· Claimed</span>}
              {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
            </div>

            {/* CTA */}
            <button
              disabled={!item.available}
              onClick={() => item.available && onRequest(item)}
              className="flex-shrink-0 gradient-btn text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Get it →
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [photos, setPhotos]           = useState<Photo[]>([]);
  const [itemMap, setItemMap]         = useState<Record<string, Item>>({});
  const [pickupSlots, setPickupSlots] = useState<string[]>([]);
  const [modal, setModal]             = useState<Item | "all" | null>(null);
  const [zoomedUrl, setZoomedUrl]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/photos").then((r) => r.json()),
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([photoData, itemData, settingsData]: [Photo[], Item[], { pickupSlots: string[] }]) => {
      setPhotos(photoData);
      const map: Record<string, Item> = {};
      itemData.forEach((it) => { map[it.id] = it; });
      setItemMap(map);
      setPickupSlots(settingsData.pickupSlots || []);
    });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const totalItems = Object.values(itemMap).length;
  const freeItems  = Object.values(itemMap).filter((i) => i.price === 0).length;
  const totalValue = Object.values(itemMap).reduce((s, i) => s + i.price, 0);

  return (
    <main className="min-h-screen" style={{ background: "#08090d" }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "#fb7185" }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-sm font-semibold tracking-widest uppercase mb-4 accent-text">Melbourne Moving Sale</div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            We&apos;re leaving{" "}
            <span className="gradient-text">Melbourne</span>
            <br />and need to find good homes<br />for our things 🌏
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Rather than throw it all away, we&apos;d love to find a family — or a few! — who will give our stuff a second life.
            Everything is well-loved and in great condition.
          </p>
          <motion.button
            onClick={() => setModal("all")}
            className="cta-pulse gradient-btn inline-flex items-center gap-3 text-white font-black text-xl px-10 py-5 rounded-2xl"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            <span>🏠</span><span>I want it ALL!</span><span>🏠</span>
          </motion.button>
          <p className="text-gray-500 text-sm mt-4">or browse individual items below ↓</p>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <div className="flex justify-center gap-8 py-6 px-6" style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a" }}>
        <div className="text-center">
          <div className="text-2xl font-black text-white">{totalItems}</div>
          <div className="text-xs text-gray-500">items</div>
        </div>
        <div className="w-px" style={{ background: "#2a2a2a" }} />
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">{freeItems}</div>
          <div className="text-xs text-gray-500">free</div>
        </div>
        <div className="w-px" style={{ background: "#2a2a2a" }} />
        <div className="text-center">
          <div className="text-2xl font-black accent-text">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">total value</div>
        </div>
      </div>

      {/* ── Photo grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-black text-white mb-8">Browse items</h2>

        {photos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo, i) => {
              const photoItems = photo.itemIds.map((id) => itemMap[id]).filter(Boolean);
              return (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  items={photoItems}
                  index={i}
                  onRequest={setModal}
                  onZoom={setZoomedUrl}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="text-center py-16 px-6" style={{ borderTop: "1px solid #1a1a1a" }}>
        <p className="text-gray-400 mb-6 text-lg">Love everything you see?</p>
        <motion.button
          onClick={() => setModal("all")}
          className="cta-pulse gradient-btn inline-flex items-center gap-3 text-white font-black text-xl px-10 py-5 rounded-2xl"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        >
          🏠 I want it ALL!
        </motion.button>
        <p className="text-gray-600 text-sm mt-4">We&apos;d love to find one family who takes everything ❤️</p>
      </section>

      {modal && <ItemModal item={modal} pickupSlots={pickupSlots} onClose={closeModal} />}
      {zoomedUrl && <Lightbox url={zoomedUrl} onClose={() => setZoomedUrl(null)} />}
    </main>
  );
}
