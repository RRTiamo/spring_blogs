"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Music,
  Wind,
  X
} from "lucide-react";
import gsap from "gsap";
import { useSysConfig } from "@/hooks/useSysConfig";

interface BgmTrack {
  title: string;
  artist: string;
  src: string;
}

interface NoiseTrack {
  name: string;
  src: string;
  icon?: string;
}

export default function TapeStation() {
  const { configs, loading } = useSysConfig();
  
  // 电台数据状态
  const [bgmList, setBgmList] = useState<BgmTrack[]>([
    { title: "You Must Believe in Spring", artist: "Bill Evans", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Merry Christmas Mr. Lawrence", artist: "Ryuichi Sakamoto", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
  ]);
  const [noiseList, setNoiseList] = useState<NoiseTrack[]>([
    { name: "林间细雨 (Rain)", src: "https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav", icon: "rain" },
    { name: "白噪风声 (Wind)", src: "https://assets.mixkit.co/active_storage/sfx/2544/2544-84.wav", icon: "wind" }
  ]);

  // 从公共系统配置加载真实配置
  useEffect(() => {
    if (!loading && configs.length > 0) {
      const cfg = configs.find(c => c.configKey === "now.content.json");
      if (cfg && cfg.configValue) {
        try {
          const parsed = JSON.parse(cfg.configValue);
          if (parsed.radio) {
            if (parsed.radio.bgmList && parsed.radio.bgmList.length > 0) {
              setBgmList(parsed.radio.bgmList);
            }
            if (parsed.radio.noiseList && parsed.radio.noiseList.length > 0) {
              setNoiseList(parsed.radio.noiseList);
            }
          }
        } catch (e) {
          console.warn("Failed to parse radio configurations from now.content.json", e);
        }
      }
    }
  }, [configs, loading]);

  // 播放状态
  const [isOpen, setIsOpen] = useState(false); // 控制面板是否展开
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBgmIdx, setCurrentBgmIdx] = useState(0);
  const [activeNoiseIdx, setActiveNoiseIdx] = useState<number | null>(null); // 当前播放的白噪音索引，null表示无
  
  // 音量控制 (0 ~ 1)
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [noiseVolume, setNoiseVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  // 音频实例 Ref
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const noiseAudioRef = useRef<HTMLAudioElement | null>(null);

  // 磁带转轴 DOM Ref
  const leftReelRef = useRef<HTMLDivElement>(null);
  const rightReelRef = useRef<HTMLDivElement>(null);
  const gsapTweenRef = useRef<gsap.core.Tween | null>(null);

  // ==================== 播放操作逻辑 ====================
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentBgmIdx((prev) => (prev + 1) % bgmList.length);
  };

  const handlePrev = () => {
    setCurrentBgmIdx((prev) => (prev - 1 + bgmList.length) % bgmList.length);
  };

  // 1. 初始化及音频事件绑定
  useEffect(() => {
    bgmAudioRef.current = new Audio();
    noiseAudioRef.current = new Audio();

    // 默认设置
    bgmAudioRef.current.loop = false;
    noiseAudioRef.current.loop = true; // 噪音通常是无限循环循环播放

    // 歌曲播放结束后自动下一首
    const handleBgmEnded = () => {
      handleNext();
    };
    bgmAudioRef.current.addEventListener("ended", handleBgmEnded);

    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current.removeEventListener("ended", handleBgmEnded);
      }
      if (noiseAudioRef.current) {
        noiseAudioRef.current.pause();
      }
    };
  }, [bgmList]);

  // 2. 监听歌曲或静音状态变化同步到原生音频
  useEffect(() => {
    if (bgmAudioRef.current && bgmList[currentBgmIdx]) {
      const wasPlaying = isPlaying;
      bgmAudioRef.current.src = bgmList[currentBgmIdx].src;
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
      if (wasPlaying) {
        bgmAudioRef.current.play().catch(e => console.warn("Auto-play blocked", e));
      }
    }
  }, [currentBgmIdx, bgmList]);

  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  // 3. 监听白噪音源及音量变化
  useEffect(() => {
    if (noiseAudioRef.current) {
      if (activeNoiseIdx !== null && noiseList[activeNoiseIdx]) {
        noiseAudioRef.current.src = noiseList[activeNoiseIdx].src;
        noiseAudioRef.current.volume = isMuted ? 0 : noiseVolume;
        if (isPlaying) {
          noiseAudioRef.current.play().catch(e => console.warn("Noise play blocked", e));
        }
      } else {
        noiseAudioRef.current.pause();
      }
    }
  }, [activeNoiseIdx, noiseList, isPlaying]);

  useEffect(() => {
    if (noiseAudioRef.current) {
      noiseAudioRef.current.volume = isMuted ? 0 : noiseVolume;
    }
  }, [noiseVolume, isMuted]);

  // ==================== GSAP 磁带物理动画控制 ====================
  const startReelAnimation = () => {
    if (!gsapTweenRef.current) {
      // 左右两个齿轮轴匀速无限旋转旋转
      const targets = [leftReelRef.current, rightReelRef.current].filter(Boolean);
      if (targets.length > 0) {
        gsapTweenRef.current = gsap.to(targets, {
          rotation: "+=360",
          repeat: -1,
          duration: 3,
          ease: "none",
          paused: true
        });
      }
    }

    if (gsapTweenRef.current) {
      gsapTweenRef.current.play();
      // 让播放速度缓动回 1 (代表重新启动)
      gsap.to(gsapTweenRef.current, { timeScale: 1, duration: 0.5, ease: "power2.out" });
    }
  };

  const stopReelAnimation = () => {
    if (gsapTweenRef.current) {
      // 缓动动画播放速度到 0 (实现阻尼减速回弹物理效果)
      gsap.to(gsapTweenRef.current, {
        timeScale: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          gsapTweenRef.current?.pause();
        }
      });
    }
  };

  // 4. 监听全局播放开关
  useEffect(() => {
    if (isPlaying) {
      if (bgmAudioRef.current && bgmAudioRef.current.src) {
        bgmAudioRef.current.play().catch(e => {
          console.warn("Bgm play failed", e);
          setIsPlaying(false);
        });
      }
      if (noiseAudioRef.current && activeNoiseIdx !== null && noiseAudioRef.current.src) {
        noiseAudioRef.current.play().catch(e => console.warn("Noise play failed", e));
      }
      
      // 启动 GSAP 磁带齿轮旋转动画
      startReelAnimation();
    } else {
      if (bgmAudioRef.current) bgmAudioRef.current.pause();
      if (noiseAudioRef.current) noiseAudioRef.current.pause();
      
      // 阻尼停止动画
      stopReelAnimation();
    }
  }, [isPlaying]);

  const selectNoise = (idx: number) => {
    if (activeNoiseIdx === idx) {
      setActiveNoiseIdx(null); // 关闭噪音
    } else {
      setActiveNoiseIdx(idx);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* 1. 复古磁带播放大面板 (isOpen 为真时以弹窗动画拉伸展开) */}
      <div 
        className={`bg-[#F7F5F0] dark:bg-[#1C221E] border border-charcoal/10 dark:border-white/10 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] w-[320px] mb-3 overflow-hidden select-none transition-all duration-500 ease-out origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-10 pointer-events-none h-0 p-0 mb-0"
        }`}
      >
        {/* 顶部拟真液晶状态显示屏 (LCD Screen) */}
        <div className="bg-[#E2EADA] dark:bg-[#2C3830] border border-charcoal/10 dark:border-black/30 rounded-xl px-4 py-2 mb-4 font-mono shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-[10px] text-charcoal/60 dark:text-cream/50 mb-1 select-none">
            <span className="flex items-center gap-1 font-bold">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-charcoal/30 dark:bg-white/20"}`} />
              {isPlaying ? "PLAYING" : "PAUSED"}
            </span>
            <span>CH: DUAL-MIX</span>
          </div>
          
          {/* 跑马灯歌名 */}
          <div className="w-full overflow-hidden relative h-5 select-none">
            <div className="absolute whitespace-nowrap text-xs font-bold text-charcoal/90 dark:text-cream/90 animate-marquee flex gap-2">
              <span>{bgmList[currentBgmIdx]?.title} - {bgmList[currentBgmIdx]?.artist}</span>
              <span className="pl-8">{bgmList[currentBgmIdx]?.title} - {bgmList[currentBgmIdx]?.artist}</span>
            </div>
          </div>
        </div>

        {/* 2. 拟物化磁带本身 (Physical Cassette Tape Body) */}
        <div className="relative bg-[#DDD7CB] dark:bg-[#2F3832] border border-charcoal/15 dark:border-white/5 rounded-2xl p-4 h-[120px] flex flex-col justify-between shadow-[0_6px_12px_rgba(0,0,0,0.03)] mb-4">
          {/* 磁带顶部标纸 */}
          <div className="h-2 w-full bg-[#C8C0AF] dark:bg-[#3D4741] rounded-full opacity-60 mb-2" />
          
          {/* 磁带卷核心透视槽 */}
          <div className="grow bg-[#B2A895] dark:bg-[#1E2521] border border-charcoal/10 dark:border-black/50 rounded-xl flex items-center justify-around relative px-6 overflow-hidden">
            {/* 左右齿轮转轴 (GSAP 驱动) */}
            <div 
              ref={leftReelRef}
              className="w-10 h-10 rounded-full border-[3px] border-dashed border-[#DDD7CB] dark:border-[#2F3832] bg-[#F7F5F0] dark:bg-[#1C221E] shadow-sm flex items-center justify-center relative origin-center"
            >
              <div className="w-3 h-3 rounded-full bg-charcoal/80 dark:bg-white/80" />
            </div>

            {/* 中间半透明磁带卷轴连接线条 */}
            <div className="absolute top-1/2 left-[20%] right-[20%] h-[1px] bg-charcoal/20 dark:bg-white/10 -translate-y-1/2 pointer-events-none" />

            <div 
              ref={rightReelRef}
              className="w-10 h-10 rounded-full border-[3px] border-dashed border-[#DDD7CB] dark:border-[#2F3832] bg-[#F7F5F0] dark:bg-[#1C221E] shadow-sm flex items-center justify-center relative origin-center"
            >
              <div className="w-3 h-3 rounded-full bg-charcoal/80 dark:bg-white/80" />
            </div>
          </div>

          {/* 磁带底部螺丝孔与拟真凸起 */}
          <div className="flex justify-between items-center text-[8px] font-mono text-charcoal/30 dark:text-white/20 mt-2 select-none px-2">
            <span>A-SIDE</span>
            <div className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal/20 dark:bg-white/10" />
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal/20 dark:bg-white/10" />
            </div>
            <span>TYPE I</span>
          </div>
        </div>

        {/* 3. 背景音乐操作物理按键 (Bgm Control Buttons) */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#27302A] border border-charcoal/10 dark:border-white/5 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ color: "var(--accent-color)" }}
            title="上一首"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button 
            onClick={handleTogglePlay}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: "var(--accent-color)" }}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#27302A] border border-charcoal/10 dark:border-white/5 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ color: "var(--accent-color)" }}
            title="下一首"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* 4. 双音轨混音调节滑块 (Dual Sound mixers) */}
        <div className="space-y-3 bg-[#EDEAE3] dark:bg-[#252E28] p-3 rounded-2xl border border-charcoal/5 dark:border-white/5 text-xs">
          {/* 音乐音量 */}
          <div className="flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="w-8 font-mono text-[10px] text-charcoal/50 dark:text-cream/50 select-none">BGM</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              style={{ accentColor: "var(--accent-color)" }}
              className="flex-1 h-1 rounded-full cursor-pointer bg-charcoal/10 dark:bg-white/10"
            />
            <span className="w-7 font-mono text-[9px] text-right text-charcoal/60 dark:text-cream/60 select-none">{Math.round(bgmVolume * 100)}%</span>
          </div>

          {/* 环境声选择与音量 */}
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="w-8 font-mono text-[10px] text-charcoal/50 dark:text-cream/50 select-none">WIND</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={noiseVolume}
              onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
              disabled={activeNoiseIdx === null}
              style={{ accentColor: "var(--accent-color)" }}
              className="flex-1 h-1 rounded-full cursor-pointer bg-charcoal/10 dark:bg-white/10 disabled:opacity-40"
            />
            <span className="w-7 font-mono text-[9px] text-right text-charcoal/60 dark:text-cream/60 select-none">{activeNoiseIdx === null ? "OFF" : `${Math.round(noiseVolume * 100)}%`}</span>
          </div>

          {/* 环境音轨切换标签 */}
          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-charcoal/5 dark:border-white/5 select-none">
            {noiseList.map((noise, idx) => (
              <button
                key={idx}
                onClick={() => selectNoise(idx)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1 border ${
                  activeNoiseIdx === idx
                    ? "bg-[#2F3832] dark:bg-[#DDD7CB] text-[#DDD7CB] dark:text-[#1E2521] border-transparent shadow-sm"
                    : "bg-white/60 dark:bg-white/5 text-charcoal/60 dark:text-cream/60 border-charcoal/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{noise.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 悬浮的磁带触发球 (Tape Trigger Sphere) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#F7F5F0] dark:bg-[#202522] border border-charcoal/10 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-center text-charcoal/70 dark:text-cream/70 hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-pointer"
        title="治愈音乐电台"
      >
        {/* 指示光标 */}
        <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-charcoal ${
          isPlaying ? "bg-red-500 animate-ping" : "bg-charcoal/30 dark:bg-white/20"
        }`} />
        
        {isOpen ? (
          <X className="w-5 h-5 text-charcoal/70 dark:text-cream/70" />
        ) : (
          <Music className="w-5 h-5 text-gold animate-[bounce_3s_infinite]" />
        )}
      </button>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 16s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
