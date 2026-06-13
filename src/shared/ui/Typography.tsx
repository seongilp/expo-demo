// 타이포그래피 프리미티브 — 시안 B (design-system.md §3).
// dark: 페어는 이 컴포넌트 내부에 캡슐화한다 (스크린 레벨 dark: 금지 규칙).
// 가격/숫자 variant(priceLg/priceMd)는 tabular-nums 강제.
import { Text, TextProps, TextStyle } from 'react-native';
import { ReactNode } from 'react';

type TTypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'micro'
  | 'label'
  | 'priceLg'
  | 'priceMd';

/** 시맨틱 텍스트 톤 — 가격 등락(up/down)·보조(sub)·비활성(faint)·반전(inverse) */
type TTypographyTone = 'default' | 'sub' | 'faint' | 'inverse' | 'up' | 'down' | 'danger' | 'primary';

interface ITypographyProps extends TextProps {
  children: ReactNode;
  variant?: TTypographyVariant;
  tone?: TTypographyTone;
  /** legacy 직접 색 지정 (가능하면 tone 사용) */
  color?: string;
  style?: TextStyle | TextStyle[];
  className?: string;
}

const VARIANT_CLASS: Record<TTypographyVariant, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  body: 'text-body',
  bodyStrong: 'text-body font-semibold',
  caption: 'text-caption',
  micro: 'text-micro',
  label: 'text-caption font-medium',
  priceLg: 'text-price-lg',
  priceMd: 'text-price-md',
};

const TONE_CLASS: Record<TTypographyTone, string> = {
  default: 'text-ink dark:text-ink-dark',
  sub: 'text-sub dark:text-sub-dark',
  faint: 'text-faint dark:text-faint-dark',
  inverse: 'text-inverse dark:text-inverse-dark',
  up: 'text-up dark:text-up-dark',
  down: 'text-down dark:text-down-dark',
  danger: 'text-danger dark:text-danger-dark',
  primary: 'text-primary-600 dark:text-primary-400',
};

/** caption/micro/label은 기본 톤이 sub — 본문 위계 (design §3) */
const DEFAULT_TONE: Partial<Record<TTypographyVariant, TTypographyTone>> = {
  caption: 'sub',
  micro: 'sub',
  label: 'sub',
};

const TABULAR_VARIANTS: ReadonlySet<TTypographyVariant> = new Set(['priceLg', 'priceMd']);

const tabularStyle: TextStyle = { fontVariant: ['tabular-nums'] };

export function AppText({
  children,
  variant = 'body',
  tone,
  color,
  style,
  className,
  ...rest
}: ITypographyProps): React.JSX.Element {
  const resolvedTone = tone ?? DEFAULT_TONE[variant] ?? 'default';
  const styles: (TextStyle | TextStyle[] | null)[] = [
    TABULAR_VARIANTS.has(variant) ? tabularStyle : null,
    color ? { color } : null,
    style ?? null,
  ];

  return (
    <Text
      style={styles.filter((entry): entry is TextStyle | TextStyle[] => entry !== null)}
      className={`${VARIANT_CLASS[variant]} ${TONE_CLASS[resolvedTone]} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
