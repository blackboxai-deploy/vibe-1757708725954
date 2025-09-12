"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const LOADING_MESSAGES = [
  "🎨 AI fırçasını hazırlıyor...",
  "🌈 Renkleri karıştırıyor...",
  "✨ Detayları işliyor...",
  "🖼️ Kompozisyonu düzenliyor...",
  "🎯 Son dokunuşları yapıyor..."
];

export default function GeneratingLoader() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // 95'te dur, gerçek response geldiğinde 100 olsun
        return prev + Math.random() * 3 + 1; // 1-4 arası random artış
      });
    }, 500);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="space-y-6 py-8">
      {/* Ana Loading Animasyonu */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Dış çember */}
          <div className="w-24 h-24 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
          
          {/* İç dönen çember */}
          <div className="absolute inset-2 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
          
          {/* Merkez icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl animate-bounce">
              🎨
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>İşleniyor...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Dinamik Mesajlar */}
      <div className="text-center">
        <p className="text-base font-medium text-blue-600 dark:text-blue-400 transition-all duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Bu işlem 30-60 saniye sürebilir
        </p>
      </div>

      {/* Dekoratif elementler */}
      <div className="flex justify-center gap-4 opacity-50">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping delay-100"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-200"></div>
        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping delay-300"></div>
      </div>
    </div>
  );
}