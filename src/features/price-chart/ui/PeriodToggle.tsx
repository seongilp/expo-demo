// 차트 기간 12/24개월 토글 (F-003) — SegmentedControl 래핑 (전환 햅틱은 컨트롤 내장).
import { SegmentedControl, ISegmentedControlOption } from '@/shared/ui';
import { EVENTS, logEvent } from '@/shared/analytics';
import type { TChartPeriodMonths } from '../types';

interface IPeriodToggleProps {
  value: TChartPeriodMonths;
  onChange: (period: TChartPeriodMonths) => void;
  className?: string;
}

const OPTIONS: ISegmentedControlOption<TChartPeriodMonths>[] = [
  { label: '12개월', value: 12 },
  { label: '24개월', value: 24 },
];

export function PeriodToggle({ value, onChange, className }: IPeriodToggleProps): React.JSX.Element {
  const handleChange = (period: TChartPeriodMonths): void => {
    logEvent(EVENTS.TOGGLE_CHART_PERIOD, { period_months: period });
    onChange(period);
  };

  return (
    <SegmentedControl<TChartPeriodMonths>
      options={OPTIONS}
      value={value}
      onChange={handleChange}
      className={`w-40 ${className ?? ''}`}
    />
  );
}
