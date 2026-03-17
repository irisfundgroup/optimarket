import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ endDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft.expired) {
    return <span className={`text-red-500 font-semibold text-sm ${className}`}>Expiré</span>;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-orange-500" />
      <div className="flex gap-1">
        {[
          { val: timeLeft.h, label: 'h' },
          { val: timeLeft.m, label: 'm' },
          { val: timeLeft.s, label: 's' },
        ].map((unit, i) => (
          <span key={i} className="bg-slate-900 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded">
            {String(unit.val).padStart(2, '0')}{unit.label}
          </span>
        ))}
      </div>
    </div>
  );
}