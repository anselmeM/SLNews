"use client";

import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import { vibrate } from "@/lib/haptics";

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== "undefined" && "speechSynthesis" in window;
const getServerSnapshot = () => false;

const activeUtterances = new Set<SpeechSynthesisUtterance>();

export default function ListenButton({ title, content }: { title: string; content: string }) {
  const [playing, setPlaying] = useState(false);
  const sessionIdRef = useRef(0);

  const isSupported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const stopAudio = useCallback(() => {
    sessionIdRef.current++;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      activeUtterances.clear();
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const toggle = useCallback(() => {
    vibrate();
    if (!isSupported || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playing) {
      stopAudio();
      return;
    }

    const sessionId = ++sessionIdRef.current;
    const text = `${title}. ${content.replace(/\n+/g, ". ")}`;
    
    // Chunk long text to prevent Chromium 15s freeze & GC drops
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    let chunkIndex = 0;

    function speakNext() {
      if (sessionId !== sessionIdRef.current) return;
      if (chunkIndex >= sentences.length) {
        setPlaying(false);
        return;
      }

      const rawChunk = sentences[chunkIndex++];
      const chunk = rawChunk ? rawChunk.trim() : "";
      if (!chunk) {
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = 0.95;
      utterance.pitch = 1;

      activeUtterances.add(utterance);

      utterance.onend = () => {
        activeUtterances.delete(utterance);
        if (sessionId === sessionIdRef.current) {
          speakNext();
        }
      };

      utterance.onerror = (e) => {
        activeUtterances.delete(utterance);
        if (e.error !== "interrupted" && e.error !== "canceled") {
          if (sessionId === sessionIdRef.current) {
            setPlaying(false);
          }
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        activeUtterances.delete(utterance);
        setPlaying(false);
      }
    }

    setPlaying(true);
    speakNext();
  }, [playing, title, content, isSupported, stopAudio]);

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
