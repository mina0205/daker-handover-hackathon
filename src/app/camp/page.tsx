'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTeams, getHackathons, addTeam } from '@/lib/storage';
import { Team, Hackathon } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import Link from 'next/link';

export default function CampPage() {
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get('hackathon');

  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(hackathonFilter || '');

  // 폼 상태
  const [form, setForm] = useState({
    name: '',
    hackathonSlug: hackathonFilter || '',
    intro: '',
    lookingFor: '',
    contactUrl: '',
    isOpen: true,
  });

  useEffect(() => {
    setHackathons(getHackathons());
    refreshTeams();
    setLoading(false);
  }, []);

  const refreshTeams = () => {
    const allTeams = getTeams();
    setTeams(allTeams);
  };

  // 필터 적용
  const filteredTeams = selectedHackathon
    ? teams.filter(t => t.hackathonSlug === selectedHackathon)
    : teams;

  const handleCreate = () => {
    if (!form.name.trim() || !form.intro.trim()) {
      alert('팀명과 소개는 필수입니다.');
      return;
    }
    if (!form.hackathonSlug) {
      alert('해커톤을 선택해주세요.');
      return;
    }

    const newTeam: Team = {
      teamCode: `T-${Date.now()}`,
      hackathonSlug: form.hackathonSlug,
      name: form.name,
      isOpen: form.isOpen,
      memberCount: 1,
      lookingFor: form.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      intro: form.intro,
      contact: { type: 'link', url: form.contactUrl || '#' },
      createdAt: new Date().toISOString(),
    };

    addTeam(newTeam);
    refreshTeams();
    setForm({ name: '', hackathonSlug: hackathonFilter || '', intro: '', lookingFor: '', contactUrl: '', isOpen: true });
    setShowForm(false);
    alert('팀이 생성되었습니다!');
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-400">팀원 모집</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? '취소' : '+ 팀 모집글 작성'}
        </button>
      </div>

      {/* 해커톤 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedHackathon('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedHackathon
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          전체
        </button>
        {hackathons.map(h => (
          <button
            key={h.slug}
            onClick={() => setSelectedHackathon(h.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedHackathon === h.slug
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {h.title.length > 20 ? h.title.slice(0, 20) + '…' : h.title}
          </button>
        ))}
      </div>

      {/* 팀 생성 폼 */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">새 팀 모집글 작성</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">해커톤 선택 *</label>
              <select
                value={form.hackathonSlug}
                onChange={e => setForm({ ...form, hackathonSlug: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {hackathons.map(h => (
                  <option key={h.slug} value={h.slug}>{h.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팀명 *</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="팀명을 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소개 *</label>
              <textarea value={form.intro}
                onChange={e => setForm({ ...form, intro: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3} placeholder="팀 소개를 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">모집 포지션</label>
              <input type="text" value={form.lookingFor}
                onChange={e => setForm({ ...form, lookingFor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Frontend, Backend, Designer (쉼표로 구분)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락 링크</label>
              <input type="text" value={form.contactUrl}
                onChange={e => setForm({ ...form, contactUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="오픈카톡 또는 구글폼 링크" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isOpen" checked={form.isOpen}
                onChange={e => setForm({ ...form, isOpen: e.target.checked })}
                className="rounded" />
              <label htmlFor="isOpen" className="text-sm text-gray-700">모집중</label>
            </div>
            <button onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              생성하기
            </button>
          </div>
        </div>
      )}

      {/* 팀 리스트 */}
      {filteredTeams.length === 0 ? (
        <EmptyState message="등록된 팀이 없습니다." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map(t => {
            const hackathon = hackathons.find(h => h.slug === t.hackathonSlug);
            return (
              <div key={t.teamCode} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{t.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {t.isOpen ? '모집중' : '마감'}
                      </span>
                    </div>
                    {hackathon && (
                      <Link href={`/hackathons/${hackathon.slug}`}
                        className="text-xs text-blue-600 hover:underline">
                        {hackathon.title}
                      </Link>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">{t.memberCount}명</span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{t.intro}</p>

                {t.lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.lookingFor.map(pos => (
                      <span key={pos} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {pos}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {t.isOpen && (
                    <a href={t.contact.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 font-medium hover:underline">
                      연락하기 →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
