// 해커톤 목록 아이템
export interface Hackathon {
  slug: string;
  title: string;
  status: 'ended' | 'ongoing' | 'upcoming';
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
}

// 해커톤 상세 sections
export interface HackathonDetail {
  slug: string;
  title: string;
  sections: {
    overview: {
      summary: string;
      teamPolicy: {
        allowSolo: boolean;
        maxTeamSize: number;
      };
    };
    info: {
      notice: string[];
      links: {
        rules: string;
        faq: string;
      };
    };
    eval: {
      metricName: string;
      description: string;
      limits?: {
        maxRuntimeSec: number;
        maxSubmissionsPerDay: number;
      };
      scoreSource?: string;
      scoreDisplay?: {
        label: string;
        breakdown: {
          key: string;
          label: string;
          weightPercent: number;
        }[];
      };
    };
    schedule: {
      timezone: string;
      milestones: {
        name: string;
        at: string;
      }[];
    };
    prize: {
      items: {
        place: string;
        amountKRW: number;
      }[];
    };
    teams: {
      campEnabled: boolean;
      listUrl: string;
    };
    submit: {
      allowedArtifactTypes: string[];
      submissionUrl: string;
      guide: string[];
      submissionItems?: {
        key: string;
        title: string;
        format: string;
      }[];
    };
    leaderboard: {
      publicLeaderboardUrl: string;
      note: string;
    };
  };
}

// 팀
export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  lookingFor: string[];
  intro: string;
  contact: {
    type: string;
    url: string;
  };
  createdAt: string;
}

// 리더보드 엔트리
export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: {
    participant: number;
    judge: number;
  };
  artifacts?: {
    webUrl: string;
    pdfUrl: string;
    planTitle: string;
  };
}

// 리더보드
export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

// 제출물
export interface Submission {
  hackathonSlug: string;
  teamName: string;
  submittedAt: string;
  artifacts: {
    plan?: string;
    webUrl?: string;
    pdfUrl?: string;
    fileName?: string;
    fileSize?: string;
  };
  notes?: string;
}
