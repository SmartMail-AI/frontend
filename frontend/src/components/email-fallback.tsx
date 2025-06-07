import { MatrixLoader } from '@/components/matrix-loader';

export default function EmailFallback() {
  return (
    <div className="flex w-full items-center justify-center flex-col relative h-[calc(100vh-140px)]">
      <MatrixLoader size="lg" />
      <p className="font-sans text-sm mt-2">이메일을 조회 중이에요.</p>
      <p className="font-sans text-sm">분류 작업에 최대 30초가량 소요될 수 있어요.</p>
    </div>
  );
}
