// 실거래 행 (F-002, nativewind-theme.md §4.5 TransactionItem).
// 좌: 면적(㎡+평 병기)+층 / 우: 금액(tabular)+계약일+뱃지(해제/직거래/신규).
// 해제 거래는 금액 취소선 + faint — 숨기지 않는다 (F-012).
import { View } from 'react-native';
import { AppText, Badge } from '@/shared/ui';
import { formatDealAmount, formatAreaWithPyeong, formatDealDateShort, isWithinDays } from '@/shared/lib';
import { ETradeType, ITransaction } from '@/entities/transaction';
import { CanceledBadge } from './CanceledBadge';

/** 신규 뱃지 기준 — 최근 7일 내 계약 */
const NEW_BADGE_DAYS = 7;

interface ITransactionItemProps {
  transaction: ITransaction;
}

export function TransactionItem({ transaction }: ITransactionItemProps): React.JSX.Element {
  const isCanceled = transaction.isCanceled;
  const isDirect = transaction.tradeType === ETradeType.DIRECT;
  const isNew = !isCanceled && isWithinDays(transaction.dealDate, NEW_BADGE_DAYS);

  return (
    <View
      accessibilityLabel={`${formatAreaWithPyeong(transaction.excluUseAr)} ${transaction.floor}층 ${formatDealAmount(transaction.dealAmount)} ${formatDealDateShort(transaction.dealDate)} 계약${isCanceled ? ' 거래해제' : ''}`}
      className="min-h-16 flex-row items-center border-b border-line px-5 py-3 dark:border-line-dark"
    >
      <View className="flex-1 pr-3">
        <AppText variant="bodyStrong">{formatAreaWithPyeong(transaction.excluUseAr)}</AppText>
        <AppText variant="caption" className="mt-0.5">
          {transaction.floor}층
        </AppText>
      </View>
      <View className="items-end">
        <AppText
          variant="priceMd"
          tone={isCanceled ? 'faint' : 'default'}
          className={isCanceled ? 'line-through' : ''}
        >
          {formatDealAmount(transaction.dealAmount)}
        </AppText>
        <View className="mt-0.5 flex-row items-center gap-1">
          <AppText variant="caption" tone="faint">
            {formatDealDateShort(transaction.dealDate)}
          </AppText>
          {isCanceled ? <CanceledBadge /> : null}
          {isDirect ? <Badge label="직거래" variant="direct" /> : null}
          {isNew ? <Badge label="신규" variant="new" /> : null}
        </View>
      </View>
    </View>
  );
}
