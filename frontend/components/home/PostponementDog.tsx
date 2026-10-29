"use client";

import { useEffect, useRef, useState } from "react";
import CyberDog from "@/components/sections/CyberDog";

export default function PostponementDog() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => setStageWidth(stage.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-1 right-3 h-24 w-40 overflow-hidden sm:bottom-4 sm:right-8 sm:w-52"
    >
      {stageWidth > 0 && <CyberDog stageWidth={stageWidth} targetX={null} mode="idle" />}
    </div>
  );
}
