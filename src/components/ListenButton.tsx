"use client";

import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import { vibrate } from "@/lib/haptics";

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== "undefined" && "speechSynthesis" in window;
const getServerSnapshot = () => false;

export default function ListenButton({ title, content }: { title: string; content: string }) {
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggle = useCallback(() => {
    vibrate();
    if (!isSupported || typeof window === "undefined") return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const text = `${title}. ${content.replace(/\n+/g, ". ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [playing, title, content, isSupported]);

  if (!isSupported) return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Stop listening" : "Listen to article audio"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
        playing
          ? "bg-primary text-white shadow-sm"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
      title={playing ? "Stop listening" : "Listen to article audio"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {playing ? "stop" : "headphones"}
      </span>
      <span className="hidden sm:inline">{playing ? "Stop Audio" : "Listen"}</span>
    </button>
  );
}
