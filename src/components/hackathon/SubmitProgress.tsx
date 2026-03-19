import { Submission } from '@/lib/types';

interface SubmitProgressProps {
  submissionItems: { key: string; title: string; format: string }[];
  submissions: Submission[];
}

export default function SubmitProgress({ submissionItems, submissions }: SubmitProgressProps) {
  const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-4">📊 제출 진행률</p>
      <div className="flex items-center gap-2">
        {submissionItems.map((item, idx) => {
          const isCompleted = latestSubmission?.artifacts?.[item.key as keyof typeof latestSubmission.artifacts];

          return (
            <div key={item.key} className="flex items-center">
              {/* 스텝 */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <p className={`text-xs mt-1 text-center max-w-[80px] ${
                  isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'
                }`}>
                  {item.title}
                </p>
              </div>

              {/* 연결선 */}
              {idx < submissionItems.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
