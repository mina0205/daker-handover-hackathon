import Link from 'next/link';

const CARDS = [
  {
    href: '/hackathons',
    emoji: '🚀',
    title: '해커톤 보러가기',
    description: '진행중인 해커톤을 확인하고 참여하세요',
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/camp',
    emoji: '👥',
    title: '팀 찾기',
    description: '함께할 팀원을 모집하거나 팀에 합류하세요',
    color: 'from-purple-500 to-purple-600',
  },
  {
    href: '/rankings',
    emoji: '🏅',
    title: '랭킹 보기',
    description: '글로벌 랭킹에서 상위 팀을 확인하세요',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function HomePage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-400 mb-4">🏆 HackHub</h1>
        <p className="text-lg text-gray-500">해커톤 참여부터 팀 모집, 제출, 랭킹까지 한 곳에서</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {CARDS.map(({ href, emoji, title, description, color }) => (
          <Link key={href} href={href}>
            <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 text-white hover:scale-105 transition-transform cursor-pointer shadow-lg`}>
              <span className="text-5xl block mb-4">{emoji}</span>
              <h2 className="text-xl font-bold mb-2">{title}</h2>
              <p className="text-sm text-white/80">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
