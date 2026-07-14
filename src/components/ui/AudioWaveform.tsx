"use client";

import { RefObject, useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

interface AudioGraph {
  context: AudioContext;
  analyser: AnalyserNode;
}

const audioGraphs = new WeakMap<HTMLAudioElement, AudioGraph>();

function getAudioGraph(audio: HTMLAudioElement) {
  const existing = audioGraphs.get(audio);
  if (existing && existing.context.state !== "closed") return existing;

  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  const analyser = context.createAnalyser();
  const source = context.createMediaElementSource(audio);
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);
  analyser.connect(context.destination);

  const graph = { context, analyser };
  audioGraphs.set(audio, graph);
  return graph;
}

export default function AudioWaveform({
  audioRef,
  isPlaying,
  currentTime,
  duration,
  onSeek,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<AudioGraph | null>(null);
  const frameRef = useRef<number | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(64));

  const [isHovered, setIsHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);

  // 基础波形柱的高度分布 (48 根柱子)
  const BAR_COUNT = 48;
  const baseHeightsRef = useRef<Float32Array>(
    Float32Array.from({ length: BAR_COUNT }, (_, i) => {
      const x = i / BAR_COUNT;
      const wave = Math.sin(x * Math.PI * 3) * 0.3;
      const pulse = Math.cos(x * Math.PI * 1.5) * 0.25;
      return Math.min(1, Math.max(0.2, 0.45 + wave + pulse));
    })
  );

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    try {
      const sourceUrl = new URL(audioRef.current.currentSrc || audioRef.current.src, window.location.origin);
      if (sourceUrl.origin !== window.location.origin) return;
      const graph = getAudioGraph(audioRef.current);
      graphRef.current = graph;
      void graph.context.resume();
    } catch {
      // AudioContext CORS fallback
    }
  }, [audioRef, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      context.clearRect(0, 0, width, height);

      const analyser = graphRef.current?.analyser;
      const freqData = frequencyDataRef.current;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqData);
      }

      const progress = duration > 0 ? currentTime / duration : 0;
      const barWidth = 3;
      const gap = (width - BAR_COUNT * barWidth) / (BAR_COUNT - 1);

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barWidth + gap);
        const barProgress = i / BAR_COUNT;

        let heightFactor = baseHeightsRef.current[i];

        if (isPlaying && !reduceMotion) {
          if (analyser && freqData[i % freqData.length]) {
            const freqVal = freqData[i % freqData.length] / 255;
            heightFactor = 0.2 + freqVal * 0.8;
          } else {
            const time = performance.now() * 0.003;
            const dynamicWave = Math.sin(time + i * 0.4) * 0.25;
            heightFactor = Math.min(1, Math.max(0.2, heightFactor + dynamicWave));
          }
        }

        const barHeight = Math.max(3, heightFactor * height * 0.85);
        const y = (height - barHeight) / 2;
        const isPassed = barProgress <= progress;

        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, 1.5);

        if (isPassed) {
          context.fillStyle = "#E07A5F"; // 进度高亮 Accent 色
          context.shadowColor = "rgba(224, 122, 95, 0.6)";
          context.shadowBlur = isPlaying ? 6 : 0;
        } else {
          context.fillStyle = "rgba(255, 255, 255, 0.22)";
          context.shadowBlur = 0;
        }

        context.fill();
      }

      if (isPlaying && !reduceMotion) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [currentTime, duration, isPlaying]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverProgress(x / rect.width);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const nextTime = (x / rect.width) * duration;
    onSeek(nextTime);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerMove={handlePointerMove}
      onClick={handleSeek}
      className="relative w-full h-4 py-1 cursor-pointer group flex items-center select-none"
      title="点击或拖动调节进度"
    >
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

      {/* Hover 时的细游标与时间提示 */}
      {isHovered && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_white] pointer-events-none z-10"
          style={{ left: `${hoverProgress * 100}%` }}
        />
      )}
    </div>
  );
}
