'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getHackathonDetail, getTeams, getLeaderboard,
  getSubmissions, addSubmission, removeSubmission
} from '@/lib/storage';
import { HackathonDetail, Team, Leaderboard, Submission } from '@/lib/types';
import Loading from '@/components/common/Loading';
import ErrorFallback from '@/components/common/ErrorFallback';
import DdayCountdown from '@/components/hackathon/DdayCountdown';
import SubmitProgress from '@/components/hackathon/SubmitProgress';
import Link from 'next/link';

const TABS = [
  { key: 'overview', label: '개요' },
  { key: 'info', label: '안내' },
  { key: 'eval', label: '평가' },
  { key: 'schedule', label: '일정' },
  { key: 'prize', label: '상금' },
  { key: 'teams', label: '팀' },
  { key: 'submit', label: '제출' },
  { key: 'leaderboard', label: '리더보드' },
];

export default function HackathonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [detail, setDetail] = useState<HackathonDetail | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});

  const [submitForm, setSubmitForm] = useState({
    plan: '', webUrl: '', pdfUrl: '', teamName: '', notes: '', web: '', pdf: ''
  });
  const [submitFile, setSubmitFile] = useState<File | null>(null);

  useEffect(() => {
    const d = getHackathonDetail(slug);
    setDetail(d);
    setTeams(getTeams(slug));
    setLeaderboard(getLeaderboard(slug));
    setSubmissions(getSubmissions(slug));
    setLoading(false);
  }, [slug]);

  if (loading) return <Loading />;
  if (!detail) return <ErrorFallback message="해커톤을 찾을 수 없습니다." />;

  const { sections } = detail;

  const handleSubmit = () => {
    if (!submitForm.teamName.trim()) {
      alert('팀명을 입력해주세요.');
      return;
    }

    const artifacts: Submission['artifacts'] = {
      plan: submitForm.plan || submitForm.plan || undefined,
      webUrl: submitForm.webUrl || submitForm.web || undefined,
      pdfUrl: submitForm.pdfUrl || submitForm.pdf || undefined,
    };

    if (submitFile) {
      artifacts.fileName = submitFile.name;
      artifacts.fileSize = `${(submitFile.size / 1024).toFixed(1)}KB`;
    }

    const newSubmission: Submission = {
      hackathonSlug: slug,
      teamName: submitForm.teamName,
      submittedAt: new Date().toISOString(),
      artifacts,
      notes: submitForm.notes || undefined,
    };

    addSubmission(newSubmission);
    setSubmissions(getSubmissions(slug));
    setSubmitForm({ plan: '', webUrl: '', pdfUrl: '', teamName: '', notes: '', web: '', pdf: '' });
    setSubmitFile(null);
    alert('제출 완료!');
  };

  const handleRemoveSubmission = (teamName: string) => {
    if (confirm('제출을 취소하시겠습니까?')) {
      removeSubmission(slug, teamName);
      setSubmissions(getSubmissions(slug));
    }
  };

  const handleInvite = (teamCode: string) => {
    setInviteStatus(prev => ({ ...prev, [teamCode]: 'pending' }));
  };
  const handleAccept = (teamCode: string) => {
    setInviteStatus(prev => ({ ...prev, [teamCode]: 'accepted' }));
  };
  const handleReject = (teamCode: string) => {
    setInviteStatus(prev => ({ ...prev, [teamCode]: 'rejected' }));
  };

  const getLeaderboardWithStatus = () => {
    if (!leaderboard) return [];
    const submittedTeamNames = new Set(leaderboard.entries.map(e => e.teamName));
    const entries = [...leaderboard.entries];
    teams.forEach(t => {
      if (!submittedTeamNames.has(t.name)) {
        entries.push({
          rank: 0,
          teamName: t.name,
          score: -1,
          submittedAt: '',
        });
      }
    });
    return entries;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{detail.title}</h1>
      <p className="text-gray-500 mb-6">{sections.overview.summary}</p>

      <div className="flex gap-1 border-b mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* ========== 개요 ========== */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-lg font-bold mb-4">개요</h2>
            <p className="text-gray-700 mb-6">{sections.overview.summary}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">팀 구성 정책</h3>
              <p className="text-sm text-gray-600">
                개인 참가: {sections.overview.teamPolicy.allowSolo ? '허용' : '불가'} · 최대 팀원: {sections.overview.teamPolicy.maxTeamSize}명
              </p>
            </div>
          </div>
        )}

        {/* ========== 안내 ========== */}
        {activeTab === 'info' && (
          <div>
            <h2 className="text-lg font-bold mb-4">안내</h2>
            <div className="space-y-3 mb-6">
              {sections.info.notice.map((n, i) => (
                <div key={i} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <p className="text-sm text-gray-700">{n}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <a href={sections.info.links.rules} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">📄 규정 보기</a>
              <a href={sections.info.links.faq} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">❓ FAQ 보기</a>
            </div>
          </div>
        )}

        {/* ========== 평가 ========== */}
        {activeTab === 'eval' && (
          <div>
            <h2 className="text-lg font-bold mb-4">평가</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold">{sections.eval.metricName}</p>
              <p className="text-sm text-gray-600 mt-1">{sections.eval.description}</p>
            </div>
            {sections.eval.limits && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">최대 런타임</p>
                  <p className="text-xl font-bold text-blue-700">{sections.eval.limits.maxRuntimeSec}초</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">일일 제출 횟수</p>
                  <p className="text-xl font-bold text-blue-700">{sections.eval.limits.maxSubmissionsPerDay}회</p>
                </div>
              </div>
            )}
            {sections.eval.scoreDisplay && (
              <div className="space-y-3">
                <p className="font-semibold">{sections.eval.scoreDisplay.label}</p>
                {sections.eval.scoreDisplay.breakdown.map(b => (
                  <div key={b.key} className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${b.weightPercent}%` }} />
                    </div>
                    <span className="text-sm font-medium w-32">{b.label} ({b.weightPercent}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== 일정 ========== */}
        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-lg font-bold mb-4">일정</h2>

            <DdayCountdown milestones={sections.schedule.milestones} />

            <div className="relative">
              {sections.schedule.milestones.map((m, i) => {
                const date = new Date(m.at);
                const now = new Date();
                const isPast = date < now;
                return (
                  <div key={i} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${isPast ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`} />
                      {i < sections.schedule.milestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>{m.name}</p>
                      <p className="text-sm text-gray-500">
                        {date.toLocaleDateString('ko-KR')} {date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== 상금 ========== */}
        {activeTab === 'prize' && (
          <div>
            <h2 className="text-lg font-bold mb-4">상금</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sections.prize.items.map((p, i) => {
                const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const bg = i === 0 ? 'bg-yellow-50 border-yellow-300' : i === 1 ? 'bg-gray-50 border-gray-300' : 'bg-orange-50 border-orange-300';
                return (
                  <div key={i} className={`rounded-xl border-2 p-6 text-center ${bg}`}>
                    <span className="text-4xl block mb-2">{emoji}</span>
                    <p className="font-bold text-lg">{p.place}</p>
                    <p className="text-2xl font-bold mt-2">{p.amountKRW.toLocaleString()}원</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== 팀 ========== */}
        {activeTab === 'teams' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold">참여 팀</h2>
              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() => setShowTeamPopup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  이 해커톤 팀 구성
                </button>
                <Link href={`/camp?hackathon=${slug}`}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  팀 모집 페이지 →
                </Link>
              </div>
            </div>

            {teams.length === 0 ? (
              <p className="text-gray-400 text-center py-8">등록된 팀이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {teams.map(t => (
                  <div key={t.teamCode} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{t.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            t.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {t.isOpen ? '모집중' : '마감'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{t.intro}</p>
                        {t.lookingFor.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {t.lookingFor.map(pos => (
                              <span key={pos} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                {pos}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 mr-2">{t.memberCount}명</span>
                        {!inviteStatus[t.teamCode] && (
                          <button onClick={() => handleInvite(t.teamCode)}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                            초대
                          </button>
                        )}
                        {inviteStatus[t.teamCode] === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleAccept(t.teamCode)}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                              수락
                            </button>
                            <button onClick={() => handleReject(t.teamCode)}
                              className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                              거절
                            </button>
                          </div>
                        )}
                        {inviteStatus[t.teamCode] === 'accepted' && (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">✓ 수락됨</span>
                        )}
                        {inviteStatus[t.teamCode] === 'rejected' && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg">거절됨</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showTeamPopup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">⚠️ 팀 구성 유의사항</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <p className="text-sm text-gray-700">개인 참가 {sections.overview.teamPolicy.allowSolo ? '가능' : '불가'}합니다.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <p className="text-sm text-gray-700">최대 팀원 수는 <strong>{sections.overview.teamPolicy.maxTeamSize}명</strong>입니다.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <p className="text-sm text-gray-700">팀 구성 후 해커톤 기간 중 팀 변경이 제한될 수 있습니다.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <p className="text-sm text-gray-700">팀 내 역할 분담을 명확히 하고, 제출 마감일을 반드시 확인하세요.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/camp?hackathon=${slug}`}
                      className="flex-1 bg-blue-600 text-white text-center px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      팀 만들러 가기
                    </Link>
                    <button onClick={() => setShowTeamPopup(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== 제출 ========== */}
        {activeTab === 'submit' && (
          <div>
            <h2 className="text-lg font-bold mb-4">제출</h2>

            {/* 제출 진행률 */}
            {sections.submit.submissionItems && (
              <SubmitProgress
                submissionItems={sections.submit.submissionItems}
                submissions={submissions}
              />
            )}

            {/* 제출 가이드 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-800 mb-2">📋 제출 가이드</p>
              {sections.submit.guide.map((g, i) => (
                <p key={i} className="text-sm text-blue-700">• {g}</p>
              ))}
              <p className="text-xs text-blue-500 mt-2">
                허용 파일 형식: {sections.submit.allowedArtifactTypes.join(', ').toUpperCase()}
              </p>
            </div>

            {/* 제출 폼 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">팀명 *</label>
                <input type="text" value={submitForm.teamName}
                  onChange={e => setSubmitForm({ ...submitForm, teamName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="팀명을 입력하세요" />
              </div>

              {sections.submit.submissionItems ? (
                sections.submit.submissionItems.map(item => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{item.title}</label>
                    <input type="text"
                      value={submitForm[item.key as keyof typeof submitForm] || ''}
                      onChange={e => setSubmitForm({ ...submitForm, [item.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={item.format === 'url' || item.format === 'pdf_url' ? 'https://...' : '내용을 입력하세요'} />
                  </div>
                ))
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제출물 URL</label>
                  <input type="text" value={submitForm.webUrl}
                    onChange={e => setSubmitForm({ ...submitForm, webUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="제출물 URL" />
                </div>
              )}

              {/* 파일 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파일 업로드 ({sections.submit.allowedArtifactTypes.join(', ').toUpperCase()})
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept={sections.submit.allowedArtifactTypes.map(t => `.${t}`).join(',')}
                    onChange={e => setSubmitFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {submitFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">📎</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{submitFile.name}</p>
                          <p className="text-xs text-gray-500">{(submitFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={e => { e.preventDefault(); setSubmitFile(null); }}
                          className="text-red-500 text-xs ml-2 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl block mb-1">📁</span>
                        <p className="text-sm text-gray-500">클릭하여 파일을 선택하세요</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {sections.submit.allowedArtifactTypes.join(', ').toUpperCase()} 형식
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
                <textarea value={submitForm.notes}
                  onChange={e => setSubmitForm({ ...submitForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} placeholder="추가 메모" />
              </div>

              <div className="flex gap-2">
                <button onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  제출하기
                </button>
                <button onClick={() => {
                  setSubmitForm({ plan: '', webUrl: '', pdfUrl: '', teamName: '', notes: '', web: '', pdf: '' });
                  setSubmitFile(null);
                }}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  초기화
                </button>
              </div>
            </div>

            {/* 제출 이력 */}
            {submissions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">제출 이력</h3>
                <div className="space-y-2">
                  {submissions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="font-medium text-sm">{s.teamName}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(s.submittedAt).toLocaleString('ko-KR')}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {s.artifacts.plan && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">📝 기획서</span>}
                          {s.artifacts.webUrl && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">🌐 웹링크</span>}
                          {s.artifacts.pdfUrl && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">📄 PDF</span>}
                          {s.artifacts.fileName && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              📎 {s.artifacts.fileName} ({s.artifacts.fileSize})
                            </span>
                          )}
                        </div>
                        {s.notes && <p className="text-xs text-gray-400 mt-1">💬 {s.notes}</p>}
                      </div>
                      <button onClick={() => handleRemoveSubmission(s.teamName)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">취소</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== 리더보드 ========== */}
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-lg font-bold mb-2">리더보드</h2>
            {sections.leaderboard.note && (
              <p className="text-sm text-gray-500 mb-4">{sections.leaderboard.note}</p>
            )}

            {(() => {
              const entries = getLeaderboardWithStatus();
              if (entries.length === 0) {
                return <p className="text-gray-400 text-center py-8">아직 리더보드 데이터가 없습니다.</p>;
              }

              const hasBreakdown = entries.some(e => e.scoreBreakdown);
              const hasArtifacts = entries.some(e => e.artifacts);

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold">순위</th>
                        <th className="text-left px-4 py-3 font-semibold">팀명</th>
                        <th className="text-left px-4 py-3 font-semibold">점수</th>
                        {hasBreakdown && (
                          <>
                            <th className="text-left px-4 py-3 font-semibold">참가자</th>
                            <th className="text-left px-4 py-3 font-semibold">심사위원</th>
                          </>
                        )}
                        <th className="text-left px-4 py-3 font-semibold">제출시간</th>
                        {hasArtifacts && (
                          <th className="text-left px-4 py-3 font-semibold">링크</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const isUnsubmitted = entry.score === -1;
                        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
                        return (
                          <tr key={idx} className={`border-b ${isUnsubmitted ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-3">{isUnsubmitted ? '-' : `${medal} ${entry.rank}`}</td>
                            <td className="px-4 py-3 font-medium">{entry.teamName}</td>
                            <td className="px-4 py-3">
                              {isUnsubmitted ? (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">미제출</span>
                              ) : (
                                <span className="font-bold text-blue-600">{entry.score}</span>
                              )}
                            </td>
                            {hasBreakdown && (
                              <>
                                <td className="px-4 py-3">{isUnsubmitted ? '-' : entry.scoreBreakdown?.participant ?? '-'}</td>
                                <td className="px-4 py-3">{isUnsubmitted ? '-' : entry.scoreBreakdown?.judge ?? '-'}</td>
                              </>
                            )}
                            <td className="px-4 py-3 text-gray-500">
                              {isUnsubmitted ? '-' : new Date(entry.submittedAt).toLocaleString('ko-KR')}
                            </td>
                            {hasArtifacts && (
                              <td className="px-4 py-3 space-x-2">
                                {isUnsubmitted ? '-' : (
                                  <>
                                    {entry.artifacts?.webUrl && (
                                      <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline">웹</a>
                                    )}
                                    {entry.artifacts?.pdfUrl && (
                                      <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline">PDF</a>
                                    )}
                                  </>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
