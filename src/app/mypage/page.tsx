'use client';
import { useEffect, useState } from 'react';
import { getHackathons, getBookmarks, toggleBookmark, getSubmissions, getMessages, getTeams  } from '@/lib/storage';
import { Hackathon, Submission } from '@/lib/types';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmark' | 'submission' | 'message'>('bookmark');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [messages, setMessages] = useState<Record<string, { text: string; sentAt: string }[]>>({});
  const [teams, setTeams] = useState<{ teamCode: string; name: string }[]>([]);

  useEffect(() => {
    setHackathons(getHackathons());
    setBookmarks(getBookmarks());
    setSubmissions(getSubmissions());
    setMessages(getMessages());
    setTeams(getTeams());
    setLoading(false);
  }, []);

  const getTeamName = (teamCode: string) => {
    const team = teams.find((t) => t.teamCode === teamCode);
    return team ? team.name : teamCode;
    };

  const bookmarkedHackathons = hackathons.filter((h) => bookmarks.includes(h.slug));

  const handleRemoveBookmark = (slug: string) => {
    toggleBookmark(slug);
    setBookmarks(getBookmarks());
  };

  const allMessageEntries = Object.entries(messages)
    .flatMap(([teamCode, msgs]) =>
      msgs.map((m) => ({ teamCode, ...m }))
    )
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  if (loading) return <Loading />;

  const TABS = [
    { key: 'bookmark' as const, label: '관심 해커톤', count: bookmarkedHackathons.length },
    { key: 'submission' as const, label: '내 제출물', count: submissions.length },
    { key: 'message' as const, label: '보낸 쪽지', count: allMessageEntries.length },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* 탭 */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 관심 해커톤 */}
      {activeTab === 'bookmark' && (
        <div>
          {bookmarkedHackathons.length === 0 ? (
            <EmptyState message="북마크한 해커톤이 없습니다. 해커톤 목록에서 ☆를 눌러 추가해보세요." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedHackathons.map((h) => (
                <div key={h.slug} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/hackathons/${h.slug}`} className="font-bold text-lg hover:text-blue-600">
                      {h.title}
                    </Link>
                    <button
                      onClick={() => handleRemoveBookmark(h.slug)}
                      className="text-yellow-500 hover:text-gray-400 text-xl"
                      title="북마크 해제"
                    >
                      ⭐
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {h.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      h.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      h.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {h.status === 'ongoing' ? '진행중' : h.status === 'upcoming' ? '예정' : '종료'}
                    </span>
                    <span>마감: {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 내 제출물 */}
      {activeTab === 'submission' && (
        <div>
          {submissions.length === 0 ? (
            <EmptyState message="제출한 산출물이 없습니다. 해커톤 상세 페이지에서 제출해보세요." />
          ) : (
            <div className="space-y-4">
              {submissions.map((s, i) => {
                const hackathon = hackathons.find((h) => h.slug === s.hackathonSlug);
                return (
                  <div key={i} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          {hackathon?.title || s.hackathonSlug}
                        </p>
                        <h3 className="font-bold text-lg">{s.teamName}</h3>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(s.submittedAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {s.artifacts.plan && (
                        <a href={s.artifacts.plan} target="_blank" rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">
                          📄 기획서
                        </a>
                      )}
                      {s.artifacts.webUrl && (
                        <a href={s.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                          🌐 웹 링크
                        </a>
                      )}
                      {s.artifacts.pdfUrl && (
                        <a href={s.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                          📎 PDF
                        </a>
                      )}
                      {s.artifacts.fileName && (
                        <span className="text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded">
                          📁 {s.artifacts.fileName} ({s.artifacts.fileSize})
                        </span>
                      )}
                    </div>
                    {s.notes && (
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">{s.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 보낸 쪽지 */}
      {activeTab === 'message' && (
        <div>
          {allMessageEntries.length === 0 ? (
            <EmptyState message="보낸 쪽지가 없습니다. 팀 모집 페이지에서 쪽지를 보내보세요." />
          ) : (
            <div className="space-y-3">
              {allMessageEntries.map((msg, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700">
                    To: {getTeamName(msg.teamCode)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.sentAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
