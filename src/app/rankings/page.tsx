'use client';
import { useEffect, useState } from 'react';
import { getHackathons, getLeaderboard } from '@/lib/storage';
import { Hackathon } from '@/lib/types';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';

interface RankingEntry {
  teamName: string;
  totalScore: number;
  hackathonCount: number;
  bestRank: number;
}

const PERIOD_FILTERS = [
  { value: 'all', label: '전체' },
  { value: '30', label: '최근 30일' },
  { value: '7', label: '최근 7일' },
];

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    buildRankings(periodFilter);
  }, [periodFilter]);

  const buildRankings = (period: string) => {
    setLoading(true);
    const hackathons: Hackathon[] = getHackathons();
    const teamMap = new Map<string, RankingEntry>();
    const now = new Date();

    hackathons.forEach(h => {
      // 기간 필터 적용: 해커톤 종료일 기준
      if (period !== 'all') {
        const days = parseInt(period);
        const endDate = new Date(h.period.endAt);
        const diffDays = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > days) return;
      }

      const lb = getLeaderboard(h.slug);
      if (!lb) return;

      lb.entries.forEach(entry => {
        const existing = teamMap.get(entry.teamName);
        if (existing) {
          existing.totalScore += entry.score;
          existing.hackathonCount += 1;
          existing.bestRank = Math.min(existing.bestRank, entry.rank);
        } else {
          teamMap.set(entry.teamName, {
            teamName: entry.teamName,
            totalScore: entry.score,
            hackathonCount: 1,
            bestRank: entry.rank,
          });
        }
      });
    });

    const sorted = Array.from(teamMap.values())
      .sort((a, b) => b.totalScore - a.totalScore);

    setRankings(sorted);
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">글로벌 랭킹</h1>
      <p className="text-gray-500 mb-6">해커톤 전체 참여/순위 기록에 대한 유저별 랭킹입니다.</p>

      {/* 기간 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PERIOD_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriodFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              periodFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rankings.length === 0 ? (
        <EmptyState message="해당 기간에 랭킹 데이터가 없습니다." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">  
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-4 font-semibold">순위</th>
                <th className="text-left px-6 py-4 font-semibold">닉네임</th>
                <th className="text-left px-6 py-4 font-semibold">포인트</th>
                <th className="text-left px-6 py-4 font-semibold">참여 횟수</th>
                <th className="text-left px-6 py-4 font-semibold">최고 순위</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry, idx) => {
                const rank = idx + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
                const bgColor = rank <= 3 ? 'bg-yellow-50/50' : '';
                return (
                  <tr key={entry.teamName} className={`border-b hover:bg-gray-50 ${bgColor}`}>
                    <td className="px-6 py-4 font-bold">{medal} {rank}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{entry.teamName}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {Number.isInteger(entry.totalScore) ? entry.totalScore : entry.totalScore.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{entry.hackathonCount}회</td>
                    <td className="px-6 py-4 text-gray-600">{entry.bestRank}위</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
