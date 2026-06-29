"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
}

function calculateTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    requestAnimationFrame(() => setTimeLeft(calculateTimeLeft(targetDate)));
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className="flex items-center space-x-1 font-mono text-[10px] tracking-wider text-charcoal/50">
      <Clock className="w-3.5 h-3.5 mr-1" />
      <span>{timeLeft.days}D</span>
      <span>:</span>
      <span>{timeLeft.hours}H</span>
      <span>:</span>
      <span>{timeLeft.minutes}M</span>
      <span>:</span>
      <span>{timeLeft.seconds}S</span>
    </span>
  );
}
