// 테마 3-way 선택 (F-009) — system/light/dark SegmentedControl.
// theme.store가 NativeWind colorScheme.set으로 전 화면 즉시 반영 + persist.
import { SegmentedControl, ISegmentedControlOption } from '@/shared/ui';
import { EVENTS, logEvent, setThemeModeProperty } from '@/shared/analytics';
import { EThemeMode, TThemeMode } from '../types';
import { useThemeStore } from '../store';

const OPTIONS: ISegmentedControlOption<TThemeMode>[] = [
  { label: '시스템', value: EThemeMode.SYSTEM },
  { label: '라이트', value: EThemeMode.LIGHT },
  { label: '다크', value: EThemeMode.DARK },
];

export function ThemeSelector(): React.JSX.Element {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const handleChange = (next: TThemeMode): void => {
    setMode(next);
    logEvent(EVENTS.TOGGLE_DARK_MODE, { mode: next });
    setThemeModeProperty(next); // 테마별 사용 패턴 코호트 (kpis user property)
  };

  return (
    <SegmentedControl<TThemeMode>
      options={OPTIONS}
      value={mode}
      onChange={handleChange}
      className="w-56"
    />
  );
}
