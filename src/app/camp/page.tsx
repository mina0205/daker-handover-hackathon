'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTeams, getHackathons, addTeam, updateTeam } from '@/lib/storage';
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
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  const [selectedHackathon, setSelectedHackathon] = useState(hackathonFilter || '');

  // 팀 생성 폼
  const [form, setForm] = useState({
    name: '',
    hackathonSlug: hackathonFilter || '',
    intro: '',
    lookingFor: '',
    contactUrl: '',
    isOpen: true,
  });

  // 팀 수정 모달
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    intro: '',
    lookingFor: '',
    contactUrl: '',
    isOpen: true,
  });

  // 쪽지/채팅 모달
  const [messageTarget, setMessageTarget] = useState<Team | null>(null);
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setHackathons(getHackathons());
    refreshTeams();
    setLoading(false);
  }, []);

  const refreshTeams = () => {
    setTeams(getTeams());
  };

  // 필터 적용
const filteredTeams = teams.filter(t => {
  if (selectedHackathon && t.hackathonSlug !== selectedHackathon) return false;
  if (positionFilter && !t.lookingFor.includes(positionFilter)) return false;
  return true;
});

// 전체 팀에서 모든 포지션 추출
const allPositions = Array.from(new Set(teams.flatMap(t => t.lookingFor))).filter(Boolean);


  // 팀 생성
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

  // 팀 수정 모달 열기
  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      intro: team.intro,
      lookingFor: team.lookingFor.join(', '),
      contactUrl: team.contact.url,
      isOpen: team.isOpen,
    });
  };

  // 팀 수정 저장
  const handleEdit = () => {
    if (!editingTeam) return;
    updateTeam(editingTeam.teamCode, {
      intro: editForm.intro,
      lookingFor: editForm.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      contact: { type: 'link', url: editForm.contactUrl },
      isOpen: editForm.isOpen,
    });
    refreshTeams();
    setEditingTeam(null);
    alert('팀 정보가 수정되었습니다.');
  };

  // 모집 마감 처리
  const handleCloseRecruit = (teamCode: string) => {
    if (confirm('모집을 마감하시겠습니까?')) {
      updateTeam(teamCode, { isOpen: false });
      refreshTeams();
    }
  };

  // 쪽지 보내기
  const handleSendMessage = () => {
    if (!messageTarget || !message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }
    setSentMessages(prev => ({
      ...prev,
      [messageTarget.teamCode]: [...(prev[messageTarget.teamCode] || []), message],
    }));
    setMessage('');
    alert(`${messageTarget.name} 팀에게 쪽지를 보냈습니다!`);
    setMessageTarget(null);
  };

  if (loading) return <Loading />;

  return (
    <div>
      
     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">팀원 모집</h1>
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

      {/* 포지션 매칭 필터 */}
      {allPositions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">🎯 내 포지션으로 팀 찾기</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPositionFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !positionFilter
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            {allPositions.map(pos => (
              <button
                key={pos}
                onClick={() => setPositionFilter(positionFilter === pos ? null : pos)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  positionFilter === pos
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      )}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">연락 링크 (오픈카톡/구글폼 등)</label>
              <input type="text" value={form.contactUrl}
                onChange={e => setForm({ ...form, contactUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://open.kakao.com/o/..." />
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
            const teamMessages = sentMessages[t.teamCode] || [];
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

                {/* 보낸 쪽지 표시 */}
                {teamMessages.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">💬 보낸 쪽지 ({teamMessages.length})</p>
                    {teamMessages.map((msg, i) => (
                      <p key={i} className="text-xs text-blue-600">• {msg}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="flex gap-2">
                    {/* 쪽지 보내기 */}
                    <button
                      onClick={() => setMessageTarget(t)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      💬 쪽지
                    </button>

                    {/* 연락하기 (외부 링크) */}
                    {t.contact.url && t.contact.url !== '#' && (
                      <a href={t.contact.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                        💬 채팅 →
                      </a>
                    )}

                    {/* 수정 */}
                    <button
                      onClick={() => openEditModal(t)}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ✏️ 수정
                    </button>

                    {/* 모집 마감 */}
                    {t.isOpen && (
                      <button
                        onClick={() => handleCloseRecruit(t.teamCode)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        마감
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 쪽지 보내기 모달 */}
      {messageTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">💬 쪽지 보내기</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-700">{messageTarget.name}</span> 팀에게 쪽지를 보냅니다.
            </p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="팀에게 보낼 메시지를 입력하세요. (예: 프론트엔드 개발자입니다. 합류하고 싶습니다!)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                보내기
              </button>
              <button
                onClick={() => { setMessageTarget(null); setMessage(''); }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팀 수정 모달 */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">✏️ 팀 정보 수정</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-700">{editingTeam.name}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
                <textarea value={editForm.intro}
                  onChange={e => setEditForm({ ...editForm, intro: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">모집 포지션</label>
                <input type="text" value={editForm.lookingFor}
                  onChange={e => setEditForm({ ...editForm, lookingFor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Frontend, Backend, Designer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락 링크</label>
                <input type="text" value={editForm.contactUrl}
                  onChange={e => setEditForm({ ...editForm, contactUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editIsOpen" checked={editForm.isOpen}
                  onChange={e => setEditForm({ ...editForm, isOpen: e.target.checked })}
                  className="rounded" />
                <label htmlFor="editIsOpen" className="text-sm text-gray-700">모집중</label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => setEditingTeam(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
