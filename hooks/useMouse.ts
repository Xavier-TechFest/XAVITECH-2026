import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Normalised pointer position (-1..1, y up) for the 3D backdrop parallax.
 * `targetX/targetY` are written on pointer events; the scene loop eases
 * `x/y` toward them each frame. Ported from the first project.
 */
export interface MouseState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export type MouseRef = MutableRefObject<MouseState>;

export function useMouse(): MouseRef {
  const mouse = useRef<MouseState>({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return mouse;
}
