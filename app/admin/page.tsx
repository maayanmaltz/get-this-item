"use client";

import { useEffect, useState, useRef } from "react";
import type { Item, Photo, Request, Settings } from "@/lib/types";

const SELLER_PASSWORD = process.env.NEXT_PUBLIC_SELLER_PASSWORD || "iloveclaude";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!value)} className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-green-500" : "bg-gray-600"}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pw === SELLER_PASSWORD) onAuth();
    else setErr("Wrong password.");
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#08090d" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-black gradient-text mb-2">Seller Login</div>
          <p className="text-gray-500 text-sm">Enter your seller password.</p>
        </div>
        <form onSubmit={login} className="space-y-4 rounded-2xl p-6" style={{ background: "#0e1015", border: "1px solid #1c2030" }}>
          {err && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{err}</div>}
          <Input label="Password" type="password" placeholder="••••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          <button type="submit" className="gradient-btn w-full text-white font-bold py-3 rounded-xl">Login</button>
        </form>
      </div>
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────

function ItemsTab({ items, onRefresh }: { items: Item[]; onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Partial<Item>>({});

  function startNew() {
    setForm({ name: "", description: "", price: 0, available: true });
    setEditingId("new");
  }

  function startEdit(item: Item) {
    setForm({ ...item });
    setEditingId(item.id);
  }

  function cancel() { setEditingId(null); setForm({}); }

  async function save() {
    if (!form.name?.trim()) return;
    if (editingId === "new") {
      await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/items/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    cancel();
    onRefresh();
  }

  async function del(id: string) {
    if (!confirm("Delete this item? It will be removed from all photos.")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div>
      {editingId ? (
        <div className="rounded-2xl p-5 mb-5" style={{ background: "#0e1015", border: "1px solid #1c2030" }}>
          <h3 className="font-bold text-white mb-4">{editingId === "new" ? "New item" : "Edit item"}</h3>
          <div className="space-y-3">
            <Input label="Name *" placeholder="e.g. Grey 3-Seater Sofa" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Condition, brand, dimensions..." value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Price ($) — 0 for Free</label>
                <input className="input" type="number" min={0} value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="pb-0.5">
                <Toggle value={form.available ?? true} onChange={(v) => setForm((f) => ({ ...f, available: v }))} label="Available" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="gradient-btn text-white font-bold px-5 py-2 rounded-xl text-sm flex-1">Save</button>
            <button onClick={cancel} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors" style={{ background: "#222" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={startNew} className="gradient-btn text-white font-bold px-5 py-2.5 rounded-xl text-sm mb-5 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add item
        </button>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "#0e1015", border: "1px solid #1c2030" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm truncate">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${item.available ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                  {item.available ? "Available" : "Claimed"}
                </span>
              </div>
              {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
              <div className="text-xs mt-0.5">
                {item.price === 0 ? <span className="text-green-400 font-semibold">FREE</span> : <span className="accent-text font-semibold">${item.price}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(item)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white" style={{ background: "#252525" }}>Edit</button>
              <button onClick={() => del(item.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300" style={{ background: "#1f1010" }}>Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center py-10 text-gray-500 text-sm">No items yet.</div>}
      </div>
    </div>
  );
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────

function PhotosTab({ photos, items, onRefresh }: { photos: Photo[]; items: Item[]; onRefresh: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetch("/api/photos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: data.url, itemIds: [] }) });
      onRefresh();
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function toggleItem(photo: Photo, itemId: string) {
    const has = photo.itemIds.includes(itemId);
    const updated = has ? photo.itemIds.filter((id) => id !== itemId) : [...photo.itemIds, itemId];
    await fetch(`/api/photos/${photo.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemIds: updated }) });
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="gradient-btn text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {uploading ? "Converting & uploading..." : "Upload photo"}
        </button>
        <span className="text-xs text-gray-500">
          {uploading ? "HEIC conversion can take ~5–10s, please wait…" : `${photos.length} photo(s)`}
        </span>
        {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
      </div>

      <div className="space-y-3">
        {photos.map((photo) => {
          const linkedItems = photo.itemIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[];
          const isOpen = expandedId === photo.id;

          return (
            <div key={photo.id} className="rounded-2xl overflow-hidden" style={{ background: "#0e1015", border: "1px solid #1c2030" }}>
              {/* Header row */}
              <div className="flex items-center gap-4 p-4">
                {/* Thumb */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative" style={{ background: "#222" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{photo.url.split("/").pop()}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {linkedItems.length === 0
                      ? <span className="text-yellow-600">No items linked</span>
                      : linkedItems.map((i) => i.name).join(", ")}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : photo.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    style={{ background: "#252525" }}
                  >
                    {isOpen ? "Close" : "Link items"}
                  </button>
                  <button onClick={() => deletePhoto(photo.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300" style={{ background: "#1f1010" }}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Item picker */}
              {isOpen && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid #242424" }}>
                  <p className="text-xs text-gray-500 mt-3 mb-3">Select which items appear in this photo:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const checked = photo.itemIds.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div
                            onClick={() => toggleItem(photo, item.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-rose-400" : "border border-gray-600"}`}
                          >
                            {checked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input type="checkbox" checked={checked} onChange={() => toggleItem(photo, item.id)} className="sr-only" />
                          <div className="min-w-0">
                            <span className="text-sm text-gray-200 truncate block">{item.name}</span>
                            <span className="text-xs">{item.price === 0 ? <span className="text-green-400">FREE</span> : <span className="text-orange-400">${item.price}</span>}</span>
                          </div>
                        </label>
                      );
                    })}
                    {items.length === 0 && <p className="text-gray-600 text-sm col-span-2">No items yet — create some in the Items tab first.</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {photos.length === 0 && <div className="text-center py-10 text-gray-500 text-sm">No photos yet. Upload one above.</div>}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ settings, onRefresh }: { settings: Settings; onRefresh: () => void }) {
  const [slots, setSlots] = useState<string[]>(settings.pickupSlots);
  const [newSlot, setNewSlot] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => { setSlots(settings.pickupSlots); }, [settings]);

  async function save() {
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pickupSlots: slots }) });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setSaveOk(true);
      onRefresh();
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  function addSlot() {
    if (newSlot.trim()) { setSlots((s) => [...s, newSlot.trim()]); setNewSlot(""); }
  }
  function removeSlot(i: number) { setSlots((s) => s.filter((_, idx) => idx !== i)); }

  return (
    <div className="max-w-lg">
      <h3 className="font-bold text-white mb-1">Pickup Slots</h3>
      <p className="text-sm text-gray-500 mb-5">These dates apply to all items and are shown to buyers when they request an item.</p>

      <div className="space-y-2 mb-4">
        {slots.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-gray-300 px-3 py-2 rounded-lg" style={{ background: "#222" }}>{s}</span>
            <button onClick={() => removeSlot(i)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {slots.length === 0 && <p className="text-gray-600 text-sm">No pickup slots yet.</p>}
      </div>

      <div className="flex gap-2 mb-6">
        <input className="input flex-1" placeholder="e.g. Saturday 17 May, 10am–2pm" value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSlot())} />
        <button onClick={addSlot} className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0" style={{ background: "#333" }}>Add</button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="gradient-btn text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60">
          {saving ? "Saving..." : "Save pickup slots"}
        </button>
        {saveOk && <span className="text-sm text-green-400">Saved!</span>}
        {saveError && <span className="text-sm text-red-400">{saveError}</span>}
      </div>
    </div>
  );
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

function RequestsTab({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return <div className="text-center py-12 text-gray-500 text-sm">No requests yet. Share your listing!</div>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="rounded-2xl p-5" style={{ background: "#0e1015", border: "1px solid #1c2030" }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-white">{r.contactName}</span>
                {r.itemId === "all" && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-900/40 text-rose-400">WANTS IT ALL</span>}
              </div>
              <div className="text-sm text-gray-400">For: <span className="text-gray-300">{r.itemName}</span></div>
            </div>
            <div className="text-xs text-gray-600 flex-shrink-0">
              {new Date(r.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {r.contactPhone && (
              <a href={`tel:${r.contactPhone}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {r.contactPhone}
              </a>
            )}
            {r.contactEmail && (
              <a href={`mailto:${r.contactEmail}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {r.contactEmail}
              </a>
            )}
            {r.pickupSlot && (
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {r.pickupSlot}
              </div>
            )}
          </div>

          {r.question && (
            <div className="mt-3 px-4 py-3 rounded-xl text-sm text-gray-300 italic" style={{ background: "#1f1f1f" }}>
              &quot;{r.question}&quot;
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

type Tab = "items" | "photos" | "settings" | "requests";

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [tab, setTab]           = useState<Tab>("photos");
  const [items, setItems]       = useState<Item[]>([]);
  const [photos, setPhotos]     = useState<Photo[]>([]);
  const [settings, setSettings] = useState<Settings>({ pickupSlots: [] });
  const [requests, setRequests] = useState<Request[]>([]);

  async function refresh() {
    const [it, ph, se, re] = await Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/photos").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/requests").then((r) => r.json()),
    ]);
    setItems(it);
    setPhotos(ph);
    setSettings(se);
    setRequests(re);
  }

  useEffect(() => { if (authed) refresh(); }, [authed]);

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "photos",   label: "Photos",   badge: photos.length },
    { id: "items",    label: "Items",    badge: items.length },
    { id: "settings", label: "Pickup Slots" },
    { id: "requests", label: "Requests", badge: requests.length },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "#08090d" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage photos, items and pickup slots.</p>
          </div>
          <a href="/" target="_blank" className="text-sm accent-text hover:text-rose-300 transition-colors">View listing ↗</a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl flex-wrap" style={{ background: "#111", width: "fit-content" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${tab === t.id ? "bg-rose-400 text-slate-900" : "text-gray-400 hover:text-white"}`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.id ? "bg-white/20 text-white" : "bg-gray-700 text-gray-400"}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "items"    && <ItemsTab    items={items}   onRefresh={refresh} />}
        {tab === "photos"   && <PhotosTab   photos={photos} items={items} onRefresh={refresh} />}
        {tab === "settings" && <SettingsTab settings={settings} onRefresh={refresh} />}
        {tab === "requests" && <RequestsTab requests={requests} />}
      </div>
    </div>
  );
}
