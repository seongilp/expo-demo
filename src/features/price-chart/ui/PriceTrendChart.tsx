// 월별 평균 매매가 추이 라인 차트 (F-003) — victory-native CartesianChart.
// 결측 월은 라인 단절(connectMissingData=false) — 0으로 그리지 않는다.
// 색상은 전부 useThemeTokens() 경유 (hex 직접 기입 0 — 다크모드 대응).
// 포인트 프레스 시 상단 인포 행에 해당 월 평균가/건수 툴팁 표기.
import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState, PointsArray } from 'victory-native';
import { Circle, matchFont } from '@shopify/react-native-skia';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { AppText } from '@/shared/ui';
import { useThemeTokens, formatEokShort, formatDealAmount, formatMonthTitle } from '@/shared/lib';
import type { IPriceTrendPoint } from '../types';

const CHART_HEIGHT = 176; // h-44
const AXIS_FONT_SIZE = 11; // micro
/** 라인 아래 영역 그라데이션 대체 — 단색 12% 틴트 (design §2.4 chart-fill) */
const AREA_ALPHA_HEX = '1F';

interface IPriceTrendChartProps {
  /** 기간 전체 연속 월 포인트 (오름차순, 결측 월 averageAmount=null) */
  points: IPriceTrendPoint[];
}

interface IChartDatum {
  index: number;
  avg: number | null;
  [key: string]: number | null;
}

const axisFont = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
  fontSize: AXIS_FONT_SIZE,
});

/** "2026-05" → "26.5" (X축 분기 라벨) */
const formatMonthShort = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  if (!year || !month) return '';
  return `${year.slice(2)}.${Number(month)}`;
};

/** 최신 dot 좌표 — 마지막 비결측 포인트 (없으면 null) */
const findLastDrawnPoint = (drawn: PointsArray): { x: number; y: number } | null => {
  for (let i = drawn.length - 1; i >= 0; i -= 1) {
    const candidate = drawn[i];
    if (typeof candidate.y === 'number') return { x: candidate.x, y: candidate.y };
  }
  return null;
};

export function PriceTrendChart({ points }: IPriceTrendChartProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const { state, isActive } = useChartPressState({ x: 0, y: { avg: 0 } });

  const data = useMemo<IChartDatum[]>(
    () => points.map((point, index) => ({ index, avg: point.averageAmount })),
    [points],
  );

  useAnimatedReaction(
    () => (isActive ? Math.round(state.x.value.value) : -1),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setPressedIndex)(current >= 0 ? current : null);
      }
    },
    [isActive],
  );

  const activePoint =
    pressedIndex !== null && pressedIndex >= 0 && pressedIndex < points.length
      ? points[pressedIndex]
      : null;

  return (
    <View accessibilityLabel="월별 평균 매매가 추이 차트">
      <View className="h-5 flex-row items-center">
        {activePoint ? (
          <AppText variant="caption" tone="sub">
            {formatMonthTitle(activePoint.monthKey)} ·{' '}
            {activePoint.averageAmount !== null
              ? `평균 ${formatDealAmount(activePoint.averageAmount)} · ${activePoint.count}건`
              : '거래 없음'}
          </AppText>
        ) : (
          <AppText variant="caption" tone="faint">
            포인트를 누르면 월별 평균가를 볼 수 있어요
          </AppText>
        )}
      </View>
      <View style={{ height: CHART_HEIGHT }} className="mt-1">
        <CartesianChart
          data={data}
          xKey="index"
          yKeys={['avg']}
          chartPressState={state}
          domainPadding={{ left: 12, right: 12, top: 16, bottom: 8 }}
          axisOptions={{
            font: axisFont,
            tickCount: { x: 4, y: 3 },
            lineColor: {
              grid: { x: 'transparent', y: tokens.chartGrid },
              frame: 'transparent',
            },
            labelColor: tokens.textTertiary,
            formatXLabel: (value) => {
              const index = Math.round(Number(value));
              const point = points[index];
              return point ? formatMonthShort(point.monthKey) : '';
            },
            formatYLabel: (value) => (typeof value === 'number' ? formatEokShort(value) : ''),
          }}
        >
          {({ points: drawn, chartBounds }) => {
            const lastPoint = findLastDrawnPoint(drawn.avg);
            return (
              <>
                <Area
                  points={drawn.avg}
                  y0={chartBounds.bottom}
                  color={`${tokens.chartLine}${AREA_ALPHA_HEX}`}
                  curveType="monotoneX"
                  connectMissingData={false}
                />
                <Line
                  points={drawn.avg}
                  color={tokens.chartLine}
                  strokeWidth={2}
                  curveType="monotoneX"
                  connectMissingData={false}
                />
                {lastPoint ? (
                  <>
                    <Circle cx={lastPoint.x} cy={lastPoint.y} r={6} color={tokens.surface} />
                    <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} color={tokens.chartLine} />
                  </>
                ) : null}
                {isActive ? (
                  <Circle
                    cx={state.x.position}
                    cy={state.y.avg.position}
                    r={5}
                    color={tokens.chartLine}
                  />
                ) : null}
              </>
            );
          }}
        </CartesianChart>
      </View>
    </View>
  );
}
