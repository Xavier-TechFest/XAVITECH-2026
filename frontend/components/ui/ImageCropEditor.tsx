"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EVENTS, EventItem } from "@/lib/eventsData";
import { ImagePlus, Minus, Plus, RotateCcw, Copy, Check, Move } from "lucide-react";

export type ImagePlacement = "card" | "carousel" | "detail";
export type ImageCrop = { x: number; y: number; zoom: number };
const KEY = "xavitech-image-crops-v1";
const DEFAULT: ImageCrop = { x: 50, y: 50, zoom: 1 };
type CropMap = Record<string, Partial<ImageCrop>>;
const cropKey = (eventId: string, placement: ImagePlacement) => `${eventId}:${placement}`;
const INITIAL_CROPS: CropMap = {
  "innocraft:card": { x: 51.171875, y: 50.14410697565543, zoom: 1 },
  "runtime-rush:card": { x: 53.2446014747191, y: 68.27378862359551, zoom: 1 },
  "runtime-rush:carousel": { x: 49.826632724719104, y: 100, zoom: 1 },
  "loot-goblins:carousel": { x: 48.931267556179776, y: 12.874531835205993, zoom: 1 },
  "vlookup:carousel": { x: 47.0483672752809, y: 0, zoom: 1 },
  "loot-goblins:card": { x: 50, y: 50, zoom: 1 },
};

export function getCrop(event: EventItem, placement: ImagePlacement): ImageCrop {
  if (typeof window === "undefined") return {
    x: Number(event.imagePosition?.split(" ")[0]?.replace("%", "")) || 50,
    y: Number(event.imagePosition?.split(" ")[1]?.replace("%", "")) || 50,
    zoom: event.imageScale || 1,
  };
  const [x, y] = (event.imagePosition || "50% 50%").split(" ");
  const builtIn = INITIAL_CROPS[cropKey(event.id, placement)];
  const parsedX = Number.parseFloat(x);
  const parsedY = Number.parseFloat(y);
  const base = { ...DEFAULT, ...builtIn, x: event.imagePosition && Number.isFinite(parsedX) ? parsedX : builtIn?.x ?? 50, y: event.imagePosition && Number.isFinite(parsedY) ? parsedY : builtIn?.y ?? 50, zoom: event.imageScale || builtIn?.zoom || 1 };
  try {
    const map: CropMap = JSON.parse(localStorage.getItem(KEY) || "{}");
    const saved = map[cropKey(event.id, placement)];
    if (saved) return { ...base, ...saved };
  } catch { /* Ignore invalid browser storage and use the event defaults. */ }
  return base;
}

export function cropStyle(crop: ImageCrop): React.CSSProperties {
  // Below 1×, show the complete source image inside the frame so tall posters
  // can fit in landscape or portrait cards instead of staying cover-cropped.
  return {
    objectPosition: `${crop.x}% ${crop.y}%`,
    objectFit: crop.zoom < 1 ? "contain" : "cover",
    transform: `scale(${crop.zoom})`,
  };
}

export function useImageCrop(event: EventItem, placement: ImagePlacement): ImageCrop {
  const [crop, setCrop] = useState<ImageCrop>(() => getCrop(event, placement));
  const refresh = useCallback(() => setCrop(getCrop(event, placement)), [event, placement]);
  useEffect(() => {
    refresh();
    window.addEventListener("xavitech-image-crops-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("xavitech-image-crops-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return crop;
}

export default function ImageCropEditor() {
  const [eventId, setEventId] = useState(EVENTS[0].id);
  const [placement, setPlacement] = useState<ImagePlacement>("card");
  const [crop, setCrop] = useState<ImageCrop>(DEFAULT);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState<{ x: number; y: number; cropX: number; cropY: number } | null>(null);
  const event = EVENTS.find((item) => item.id === eventId) || EVENTS[0];

  const load = () => setCrop(getCrop(event, placement));
  useEffect(load, [eventId, placement]);
  const save = (next: ImageCrop) => {
    setCrop(next);
    try {
      const map: CropMap = JSON.parse(localStorage.getItem(KEY) || "{}");
      map[cropKey(eventId, placement)] = next;
      localStorage.setItem(KEY, JSON.stringify(map));
      window.dispatchEvent(new Event("xavitech-image-crops-changed"));
    } catch { /* The preview remains editable if storage is unavailable. */ }
  };
  const reset = () => {
    try {
      const map: CropMap = JSON.parse(localStorage.getItem(KEY) || "{}");
      delete map[cropKey(eventId, placement)];
      localStorage.setItem(KEY, JSON.stringify(map));
      window.dispatchEvent(new Event("xavitech-image-crops-changed"));
    } catch { /* Keep the reset action available even when storage is unavailable. */ }
    load();
  };
  const copyAll = async () => {
    const map: CropMap = JSON.parse(localStorage.getItem(KEY) || "{}");
    const overrides = Object.fromEntries(Object.entries(map).map(([key, value]) => {
      const [id, target] = key.split(":");
      return [`${id}.${target}`, value];
    }));
    await navigator.clipboard.writeText(JSON.stringify(overrides, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const bounds = useMemo(() => placement === "card" ? "aspect-[2/3]" : placement === "detail" ? "aspect-[4/5]" : "aspect-video", [placement]);

  return <div className="fixed bottom-4 right-4 z-[90] font-sans text-white">
    {!open ? <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full border border-cyan-300/50 bg-[#06121b]/95 px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur"><ImagePlus size={17} /> Adjust event images</button> :
      <section className="w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-cyan-300/35 bg-[#06121b]/[.97] shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><p className="text-sm font-bold">Image position editor</p><p className="mt-0.5 text-xs text-slate-400">Drag image to frame it, then zoom.</p></div><button onClick={() => setOpen(false)} aria-label="Close editor" className="rounded px-2 py-1 text-slate-300 hover:bg-white/10">✕</button></header>
        <div className="space-y-3 p-4">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Event<select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0b1a25] px-3 py-2.5 text-sm text-white">{EVENTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/30 p-1">{(["card", "carousel", "detail"] as ImagePlacement[]).map((target) => <button key={target} onClick={() => setPlacement(target)} className={`rounded-md py-2 text-xs capitalize ${placement === target ? "bg-cyan-300/20 text-cyan-200" : "text-slate-400 hover:text-white"}`}>{target === "detail" ? "Event page" : target === "card" ? "Card" : "Carousel"}</button>)}</div>
          <div className={`${bounds} relative touch-none cursor-grab overflow-hidden rounded-lg border border-white/20 active:cursor-grabbing`} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag({ x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y }); }} onPointerMove={(e) => { if (!drag) return; const rect = e.currentTarget.getBoundingClientRect(); save({ ...crop, x: Math.max(0, Math.min(100, drag.cropX - (e.clientX - drag.x) / rect.width * 100)), y: Math.max(0, Math.min(100, drag.cropY - (e.clientY - drag.y) / rect.height * 100)) }); }} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
            <img draggable={false} src={event.image} alt={`${event.name} crop preview`} className="h-full w-full object-cover" style={cropStyle(crop)} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/><span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-semibold text-white"><Move size={12}/> DRAG TO REPOSITION</span>
          </div>
          <div className="flex items-center gap-3"><span className="text-xs text-slate-300">Zoom</span><button aria-label="Zoom out" onClick={() => save({ ...crop, zoom: Math.max(0.1, +(crop.zoom - 0.05).toFixed(2)) })} className="rounded border border-white/15 p-2 hover:bg-white/10"><Minus size={14}/></button><input aria-label="Image zoom" type="range" min="0.1" max="2.5" step="0.01" value={crop.zoom} onChange={(e) => save({ ...crop, zoom: Number(e.target.value) })} className="min-w-0 flex-1 accent-cyan-300"/><button aria-label="Zoom in" onClick={() => save({ ...crop, zoom: Math.min(2.5, +(crop.zoom + 0.05).toFixed(2)) })} className="rounded border border-white/15 p-2 hover:bg-white/10"><Plus size={14}/></button><span className="w-10 text-right text-xs tabular-nums">{crop.zoom.toFixed(2)}×</span></div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3"><button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"><RotateCcw size={13}/> Reset this view</button><button onClick={copyAll} className="flex items-center gap-1.5 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied" : "Copy settings"}</button></div>
          <p className="text-[10px] leading-relaxed text-slate-500">Your adjustments save in this browser. Copy settings when you’re finished to transfer them into the site.</p>
        </div>
      </section>}
  </div>;
}
