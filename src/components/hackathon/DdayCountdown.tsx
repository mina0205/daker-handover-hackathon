'use client';
import { useEffect, useState } from 'react';

interface DdayCountdownProps {
  milestones: { name: string; at: string }[];
}

export default function DdayCountdown({ milestones }: DdayCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 다음 마일스톤 찾기
  const next = milestones.find(m => new Date(m.at) > now);

  if (!next) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">모든 일정이 종료되었습니다.</p>
      </div>
    );
  }

  const diff = new Date(next.at).getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
      <p className="text-sm text-blue-200 mb-1">다음 일정</p>
      <p className="font-bold text-lg mb-4">{next.name}</p>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <p className="text-3xl font-bold">{days}</p>
          <p className="text-xs text-blue-200">일</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <p className="text-3xl font-bold">{hours}</p>
          <p className="text-xs text-blue-200">시간</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <p className="text-3xl font-bold">{minutes}</p>
          <p className="text-xs text-blue-200">분</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <p className="text-3xl font-bold">{seconds}</p>
          <p className="text-xs text-blue-200">초</p>
        </div>
      </div>
    </div>
  );
}
