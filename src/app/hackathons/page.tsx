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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getHackathons();
    setHackathons(data);
    setLoading(false);
  }, []);

  const allTags = Array.from(new Set(hackathons.flatMap(h => h.tags)));

  const filtered = hackathons.filter(h => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (tagFilter && !h.tags.includes(tagFilter)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(query);
      const matchTag = h.tags.some(t => t.toLowerCase().includes(query));
      if (!matchTitle && !matchTag) return false;
    }
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">해커톤 목록</h1>

      {/* 검색 */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="해커톤 제목 또는 태그로 검색"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

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

      {/* 검색 결과 안내 */}
      {searchQuery.trim() && (
        <p className="text-sm text-gray-500 mb-4">
          &quot;{searchQuery}&quot; 검색 결과: {filtered.length}건
        </p>
      )}

      {/* 카드 리스트 */}
      {filtered.length === 0 ? (
        <EmptyState message={searchQuery.trim() ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '해당하는 해커톤이 없습니다.'} />
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
