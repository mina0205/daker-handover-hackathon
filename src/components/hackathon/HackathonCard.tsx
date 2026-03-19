'use client';
import Link from 'next/link';
import { Hackathon } from '@/lib/types';
import { getTeams, getBookmarks, toggleBookmark } from '@/lib/storage';
import { useEffect, useState } from 'react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ongoing: { label: '진행중', color: 'bg-green-100 text-green-700' },
  upcoming: { label: '예정', color: 'bg-blue-100 text-blue-700' },
  ended: { label: '종료', color: 'bg-gray-100 text-gray-500' },
};

export default function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const [teamCount, setTeamCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const status = STATUS_MAP[hackathon.status] || STATUS_MAP.ended;
  const deadline = new Date(hackathon.period.submissionDeadlineAt).toLocaleDateString('ko-KR');
  const end = new Date(hackathon.period.endAt).toLocaleDateString('ko-KR');

  useEffect(() => {
    setTeamCount(getTeams(hackathon.slug).length);
    setBookmarked(getBookmarks().includes(hackathon.slug));
  }, [hackathon.slug]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleBookmark(hackathon.slug);
    setBookmarked(added);
  };

  return (
    <Link href={`/hackathons/${hackathon.slug}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden relative">
        {/* 북마크 버튼 */}
        <button
          onClick={handleBookmark}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="북마크"
        >
          {bookmarked ? '⭐' : '☆'}
        </button>

        {/* 썸네일 */}
        <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-6xl">🏆</span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
            {hackathon.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
            {hackathon.title}
          </h3>

          <div className="text-sm text-gray-500 space-y-1">
            <p>📅 제출 마감: {deadline}</p>
            <p>🏁 종료: {end}</p>
            <p>👥 참가 팀: {teamCount}팀</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
