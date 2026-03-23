'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTeams, getHackathons, addTeam, updateTeam, getMessages, addMessage } from '@/lib/storage';
import { Team, Hackathon } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';

function CampContent() {
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get('hackathon');

  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(hackathonFilter || '');
  const [positionFilter, setPositionFilter] = useState('');

  const [sentMessages, setSentMessages] = useState<Record<string, { text: string; sentAt: string }[]>>({});
  const [messageTarget, setMessageTarget] = useState<Team | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    hackathonSlug: hackathonFilter || '',
    intro: '',
    lookingFor: '',
    contactUrl: '',
    isOpen: true,
  });

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    intro: '',
    lookingFor: '',
    contactUrl: '',
    isOpen: true,
  });

  useEffect(() => {
    setHackathons(getHackathons());
    refreshTeams();
    setSentMessages(getMessages());
    setLoading(false);
  }, []);

  const refreshTeams = () => setTeams(getTeams());

  const filteredTeams = teams
    .filter((t) => {
      const hackathonMatch = selectedHackathon ? t.hackathonSlug === selectedHackathon : true;
       const positionMatch = positionFilter
    ? (t.lookingFor && t.lookingFor.some((l) => l.toLowerCase().includes(positionFilter.toLowerCase())))
    : true;

      return hackathonMatch && positionMatch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const allPositions = Array.from(
    new Set(teams.flatMap((t) => (t.lookingFor || []).map((l) => l.toLowerCase())))
  );

  const isNewTeam = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

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
      teamCode: `team-${Date.now()}`,
      hackathonSlug: form.hackathonSlug,
      name: form.name,
      intro: form.intro,
      memberCount: 1,
      lookingFor: form.lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
      isOpen: form.isOpen,
      contact: { type: 'url', url: form.contactUrl || '#' },
      createdAt: new Date().toISOString(),
    };

    addTeam(newTeam);
    refreshTeams();
    setForm({ name: '', hackathonSlug: hackathonFilter || '', intro: '', lookingFor: '', contactUrl: '', isOpen: true });
    setShowForm(false);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      intro: team.intro || '',
      lookingFor: (team.lookingFor || []).join(', '),
      contactUrl: team.contact?.url || '',
      isOpen: team.isOpen,
    });
  };

  const handleEdit = () => {
    if (!editingTeam) return;
    updateTeam(editingTeam.teamCode, {
      intro: editForm.intro,
      lookingFor: editForm.lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
      contact: { type: 'url', url: editForm.contactUrl },
      isOpen: editForm.isOpen,
    });
    refreshTeams();
    setEditingTeam(null);
  };

  const handleCloseRecruit = (teamCode: string) => {
    if (confirm('모집을 마감하시겠습니까?')) {
      updateTeam(teamCode, { isOpen: false });
      refreshTeams();
    }
  };

  const handleSendMessage = () => {
    if (!messageTarget || !message.trim()) return;
    addMessage(messageTarget.teamCode, message.trim());
    setSentMessages(getMessages());
    setMessage('');
    alert(`${messageTarget.name} 팀에게 쪽지를 보냈습니다!`);
    setMessageTarget(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">팀원 모집</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          {showForm ? '취소' : '+ 팀 모집글 작성'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setSelectedHackathon('')}
          className={`px-3 py-1 rounded-full text-sm border ${
            !selectedHackathon ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          전체
        </button>
        {hackathons.map((h) => (
          <button
            key={h.slug}
            onClick={() => setSelectedHackathon(h.slug)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedHackathon === h.slug ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {h.title}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setPositionFilter('')}
          className={`px-3 py-1 rounded-full text-sm border ${
            !positionFilter ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          전체 포지션
        </button>
        {allPositions.map((p) => (
          <button
            key={p}
            onClick={() => setPositionFilter(p)}
            className={`px-3 py-1 rounded-full text-sm border ${
              positionFilter === p ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-gray-50 border rounded-xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">새 팀 모집글</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">해커톤 선택 *</label>
              <select
                value={form.hackathonSlug}
                onChange={(e) => setForm({ ...form, hackathonSlug: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">선택하세요</option>
                {hackathons.map((h) => (
                  <option key={h.slug} value={h.slug}>{h.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">팀명 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="팀명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">팀 소개 *</label>
              <textarea
                value={form.intro}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="팀을 소개해주세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">모집 포지션 (쉼표 구분)</label>
              <input
                value={form.lookingFor}
                onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="예: 프론트엔드, 백엔드, 디자이너"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">연락처 URL</label>
              <input
                value={form.contactUrl}
                onChange={(e) => setForm({ ...form, contactUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="카카오톡 오픈채팅 또는 구글폼 링크"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
              />
              <label className="text-sm">모집 중</label>
            </div>
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              등록하기
            </button>
          </div>
        </div>
      )}

      {filteredTeams.length === 0 ? (
        <EmptyState message="등록된 팀이 없습니다." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((t) => (
            <div key={t.teamCode} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">
                    {t.name}
                    {isNewTeam(t.createdAt) && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      t.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.isOpen ? '모집중' : '마감'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{t.memberCount}명</span>
              </div>

              {t.intro && <p className="text-sm text-gray-600 mb-2">{t.intro}</p>}

              {t.lookingFor && t.lookingFor.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.lookingFor.map((pos, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                      {pos}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => setMessageTarget(t)}
                  className="text-sm px-3 py-1 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                >
                  💬 쪽지
                </button>
                {t.contact?.url && (
                  <a
                    href={t.contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    📞 연락 →
                  </a>
                )}
                <button
                  onClick={() => openEditModal(t)}
                  className="text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                >
                  ✏️ 수정
                </button>
                {t.isOpen && (
                  <button
                    onClick={() => handleCloseRecruit(t.teamCode)}
                    className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    마감
                  </button>
                )}
              </div>

              {sentMessages[t.teamCode] && sentMessages[t.teamCode].length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-400 mb-1">보낸 쪽지:</p>
                  {sentMessages[t.teamCode].map((msg, i) => (
                    <div key={i} className="text-sm text-gray-600 bg-yellow-50 px-2 py-1 rounded mb-1">
                      {msg.text}
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(msg.sentAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {messageTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-3">{messageTarget.name} 팀에게 쪽지</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              rows={4}
              placeholder="쪽지 내용을 입력하세요"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setMessageTarget(null); setMessage(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-3">{editingTeam.name} 팀 수정</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">팀 소개</label>
                <textarea
                  value={editForm.intro}
                  onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">모집 포지션 (쉼표 구분)</label>
                <input
                  value={editForm.lookingFor}
                  onChange={(e) => setEditForm({ ...editForm, lookingFor: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">연락처 URL</label>
                <input
                  value={editForm.contactUrl}
                  onChange={(e) => setEditForm({ ...editForm, contactUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isOpen}
                  onChange={(e) => setEditForm({ ...editForm, isOpen: e.target.checked })}
                />
                <label className="text-sm">모집 중</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CampContent />
    </Suspense>
  );
}
