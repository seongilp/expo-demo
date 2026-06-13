// 스크린 컨테이너 — SafeAreaView + bg-background 캡슐화 (Hard Threshold: SafeArea 누락 0).
// 스크린 코드에서 dark: 직접 작성을 막기 위한 조립 프리미티브 (design §6).
import { ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface IScreenProps {
  children: ReactNode;
  /** 기본 top — 탭 화면(bottom은 탭바), push 화면(bottom은 배너/contentPadding) 공통 */
  edges?: Edge[];
  style?: ViewStyle;
  className?: string;
}

export function Screen({
  children,
  edges = ['top'],
  style,
  className,
}: IScreenProps): React.JSX.Element {
  return (
    <SafeAreaView
      edges={edges}
      style={style}
      className={`flex-1 bg-background dark:bg-background-dark ${className ?? ''}`}
    >
      {children}
    </SafeAreaView>
  );
}
