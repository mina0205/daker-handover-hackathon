'use client';
import { useEffect, useState } from 'react';
import { getHackathons } from '@/lib/storage';
import { Hackathon } from '@/lib/types';
import HackathonCard from '@/components/hackathon/HackathonCard';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';

const STATUS_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'upcoming', label: '예정' },
  { value: 'ended', label: '종료' },
];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getHackathons();
    setHackathons(data);
    setLoading(false);
  }, []);

  // 모든 태그 추출
  const allTags = Array.from(new Set(hackathons.flatMap(h => h.tags)));

  // 필터 적용
  const filtered = hackathons.filter(h => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (tagFilter && !h.tags.includes(tagFilter)) return false;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-400 mb-6">해커톤 목록</h1>

      {/* 상태 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 태그 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tagFilter === tag
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 카드 리스트 */}
      {filtered.length === 0 ? (
        <EmptyState message="해당하는 해커톤이 없습니다." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(h => (
            <HackathonCard key={h.slug} hackathon={h} />
          ))}
        </div>
      )}
    </div>
  );
}
