"use client";

import { useState, useRef, useCallback } from "react";
import { vibrate } from "@/lib/haptics";

export default function ListenButton({ title, content }: { title: string; content: string }) {
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggle = useCallback(() => {
    vibrate();
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const text = `${title}. ${content.replace(/\n+/g, ". ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [playing, title, content]);

  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
        playing
          ? "bg-primary text-white"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
      title={playing ? "Stop listening" : "Listen to article"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {playing ? "stop" : "headphones"}
      </span>
      <span className="hidden sm:inline">{playing ? "Stop" : "Listen"}</span>
    </button>
  );
}
