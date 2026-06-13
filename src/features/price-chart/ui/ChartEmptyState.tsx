// 차트 빈 상태 (F-003) — 데이터 있는 월 2개 미만이면 추이를 그리지 않는다.
// 카드 자체는 유지하고 내부만 빈 상태로 교체 (screen-layouts.md §5).
import { EmptyState } from '@/shared/ui';

export function ChartEmptyState(): React.JSX.Element {
  return (
    <EmptyState
      icon="trending-up-outline"
      title="표시할 거래가 부족해요"
      description="최근 거래가 쌓이면 추이를 보여드려요"
      compact
    />
  );
}
