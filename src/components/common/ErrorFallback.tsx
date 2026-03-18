interface ErrorFallbackProps {
  message?: string;
}

export default function ErrorFallback({ message = '데이터를 불러오는 중 오류가 발생했습니다.' }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-red-400">
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-lg">{message}</p>
    </div>
  );
}
