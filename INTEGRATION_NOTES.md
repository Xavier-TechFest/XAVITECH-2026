# Integration notes (v2)

Base = your responsive project (sections, order, CyberDog untouched).

## One sci-fi language everywhere
- Palette: teal (primary) + marigold (accent). Pink only as a rare alert accent.
- Every section opens with the same mono label: `// 01 ── ABOUT`, `// 02 ── TRACKS` …
- The neon city is now a **planet limb with spaceport spires** (`effects/Horizon.tsx`) – the hero
  and the footer bookend the page on the same horizon.
- Fixed flight-deck HUD (`effects/HudFrame.tsx`): section rail (click to jump), sector / velocity
  readout, corner brackets, scan sweep on every section change.

## Scroll = camera moves (`experience/CameraRig.tsx`)
One camera shot per section (push-in, truck left + bank, settle, truck right + bank, crane up,
pull down), a "kick" (surge + FOV punch) when you cross into a new section, FOV + hyperspace
streaks on fast scrolling. Per-section scenery: station (hero), ringed planet (about),
ring gate (tracks→schedule), debris field you fly through (events).

## Binary
Now sparse, slow, head-lit **data streams** (`effects/DataStreams.tsx`): hugging the hero margins,
and a lighter version inside About. The dense full-screen rain and the 3D digits are gone.

## Interactive, per section
- Hero: click / tap the sky to fire bolts from the two turrets.
- About: scanner reticle with live coordinates; click pings it and cycles the domain.
- Tracks: (yours) – selecting a track now also flashes the 3D ring gate.
- Events: track filter chips reshuffle the carousel. Hover clipping fixed (more top padding).
- Schedule: timeline charges as you scroll; click a slot for its mission clock (T-minus).
- Footer: "Return to launch" – long smooth scroll = warp.

## Edited in your files
Hero, Introduction, Tracks (2 small edits), EventsPreview, Schedule (now client), Backdrops,
Footer (button), Countdown (`EVENT_DATE` exported), page.tsx, globals.css, next.config.mjs, package.json.

Run `npm install` (not `npm ci`) once.
