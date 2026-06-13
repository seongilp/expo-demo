// 해제 거래 뱃지 (F-012) — 동반 규칙: 해당 행 금액은 취소선 + faint 처리 (TransactionItem).
// 해제 건을 숨기지 않고 표기하는 것이 데이터 투명성 원칙 (design Do's #6).
import { Badge } from '@/shared/ui';

export function CanceledBadge(): React.JSX.Element {
  return <Badge label="거래해제" variant="canceled" />;
}
