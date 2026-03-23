import hackathonsData from '@/data/hackathons.json';
import hackathonDetailsData from '@/data/hackathonDetails.json';
import teamsData from '@/data/teams.json';
import leaderboardsData from '@/data/leaderboards.json';
import { Hackathon, HackathonDetail, Team, Leaderboard, Submission } from './types';

const KEYS = {
  hackathons: 'hackathons',
  hackathonDetails: 'hackathonDetails',
  teams: 'teams',
  submissions: 'submissions',
  leaderboards: 'leaderboards',
} as const;

export function initStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.hackathons)) {
    localStorage.setItem(KEYS.hackathons, JSON.stringify(hackathonsData));
  }
  if (!localStorage.getItem(KEYS.hackathonDetails)) {
    localStorage.setItem(KEYS.hackathonDetails, JSON.stringify(hackathonDetailsData));
  }
  if (!localStorage.getItem(KEYS.teams)) {
    localStorage.setItem(KEYS.teams, JSON.stringify(teamsData));
  }
  if (!localStorage.getItem(KEYS.leaderboards)) {
    localStorage.setItem(KEYS.leaderboards, JSON.stringify(leaderboardsData));
  }
  if (!localStorage.getItem(KEYS.submissions)) {
    localStorage.setItem(KEYS.submissions, JSON.stringify([]));
  }
}

// 해커톤 목록
export function getHackathons(): Hackathon[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.hackathons) || '[]');
  } catch { return []; }
}

// 해커톤 상세
export function getHackathonDetail(slug: string): HackathonDetail | null {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.hackathonDetails) || '{}');
    return all[slug] || null;
  } catch { return null; }
}

// 팀 목록
export function getTeams(hackathonSlug?: string): Team[] {
  try {
    const all: Team[] = JSON.parse(localStorage.getItem(KEYS.teams) || '[]');
    if (hackathonSlug) return all.filter(t => t.hackathonSlug === hackathonSlug);
    return all;
  } catch { return []; }
}

// 팀 생성
export function addTeam(team: Team) {
  const teams = getTeams();
  teams.push(team);
  localStorage.setItem(KEYS.teams, JSON.stringify(teams));
}

// 팀 수정
export function updateTeam(teamCode: string, updates: Partial<Team>) {
  const teams = getTeams();
  const idx = teams.findIndex(t => t.teamCode === teamCode);
  if (idx !== -1) {
    teams[idx] = { ...teams[idx], ...updates };
    localStorage.setItem(KEYS.teams, JSON.stringify(teams));
  }
}

// 리더보드
export function getLeaderboard(hackathonSlug: string): Leaderboard | null {
  try {
    const all: Leaderboard[] = JSON.parse(localStorage.getItem(KEYS.leaderboards) || '[]');
    return all.find(l => l.hackathonSlug === hackathonSlug) || null;
  } catch { return null; }
}

// 제출물
export function getSubmissions(hackathonSlug?: string): Submission[] {
  try {
    const all: Submission[] = JSON.parse(localStorage.getItem(KEYS.submissions) || '[]');
    if (hackathonSlug) return all.filter((s) => s.hackathonSlug === hackathonSlug);
    return all;
  } catch { return []; }
}

export function addSubmission(submission: Submission) {
  try {
    const all: Submission[] = JSON.parse(localStorage.getItem(KEYS.submissions) || '[]');
    all.push(submission);
    localStorage.setItem(KEYS.submissions, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function removeSubmission(hackathonSlug: string, teamName: string) {
  try {
    const all: Submission[] = JSON.parse(localStorage.getItem(KEYS.submissions) || '[]');
    const filtered = all.filter(s => !(s.hackathonSlug === hackathonSlug && s.teamName === teamName));
    localStorage.setItem(KEYS.submissions, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

// 북마크
export function getBookmarks(): string[] {
  try {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  } catch { return []; }
}

export function toggleBookmark(slug: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx === -1) {
    bookmarks.push(slug);
  } else {
    bookmarks.splice(idx, 1);
  }
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  return idx === -1; // true = 추가됨, false = 제거됨
}

// 쪽지
export function getMessages(): Record<string, { text: string; sentAt: string }[]> {
  try {
    return JSON.parse(localStorage.getItem('messages') || '{}');
  } catch { return {}; }
}

export function addMessage(teamCode: string, text: string) {
  const messages = getMessages();
  if (!messages[teamCode]) messages[teamCode] = [];
  messages[teamCode].push({ text, sentAt: new Date().toISOString() });
  localStorage.setItem('messages', JSON.stringify(messages));
}
