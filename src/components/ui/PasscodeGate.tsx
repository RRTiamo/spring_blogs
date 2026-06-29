"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicConfig } from "@/api/config";

interface PasscodeGateProps {
  onUnlock: () => void;
  passcode?: string; // 默认口令
  title?: string;
  description?: string;
}

export default function PasscodeGate({
  onUnlock,
  passcode = "2026",
  title = "数字档案馆加密区",
  description = "本区块包含私人信件与恋爱相册。请输入访问口令（默认：2026）解锁查看。",
}: PasscodeGateProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const [currentPasscode, setCurrentPasscode] = useState(passcode);
  const [remotePasscodeLoaded, setRemotePasscodeLoaded] = useState(false);

  useEffect(() => {
    // 检查本会话中是否已经解锁过
    const isUnlocked = sessionStorage.getItem("atlas_unlocked") === "true";
    if (isUnlocked) {
      onUnlock();
    }
  }, [onUnlock]);

  useEffect(() => {
    const fetchRemotePasscode = async () => {
      try {
        const response = await getPublicConfig();
        const payload = response.data;
        if (payload?.code === 200 && Array.isArray(payload.data)) {
          const passcodeItem = payload.data.find(
            (item: any) => item.configKey === "site.access.passcode"
          );
          if (passcodeItem?.configValue) {
            setCurrentPasscode(passcodeItem.configValue);
            setRemotePasscodeLoaded(true);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch remote passcode, using local fallback.", err);
      }
    };
    fetchRemotePasscode();
  }, []);

  const displayDescription =
    remotePasscodeLoaded && currentPasscode !== "2026"
      ? description.replace("（默认：2026）", "")
      : description;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === currentPasscode) {
      sessionStorage.setItem("atlas_unlocked", "true");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full border border-charcoal/10 bg-white/40 backdrop-blur-md p-10 md:p-12 text-center relative"
      >
        {/* 复古精致四角边框线 */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-charcoal/30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-charcoal/30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-charcoal/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-charcoal/30" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-charcoal/10 mb-6 text-charcoal/50">
          <Lock className="w-5 h-5 stroke-[1.25]" />
        </div>

        <h2 className="font-serif text-2xl font-light tracking-wide text-charcoal mb-3">
          {title}
        </h2>
        <p className="text-xs md:text-sm font-sans text-charcoal/60 leading-relaxed tracking-wider mb-8 max-w-70 mx-auto">
          {displayDescription}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative border-b border-charcoal/30 focus-within:border-charcoal transition-colors">
            <input
              type="password"
              placeholder="ENTER PASSCODE"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              className="w-full bg-transparent border-none py-3 text-center text-sm tracking-[0.5em] focus:outline-none placeholder:text-charcoal/30 placeholder:tracking-normal font-mono"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-800 tracking-wider mt-2 font-light"
              >
                口令有误，请重新输入。
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full mt-6 bg-charcoal text-cream hover:bg-gold hover:text-charcoal transition-colors py-3 text-xs tracking-widest font-sans font-light uppercase cursor-pointer"
          >
            解锁数字档案
          </button>
        </form>
      </motion.div>
    </div>
  );
}
