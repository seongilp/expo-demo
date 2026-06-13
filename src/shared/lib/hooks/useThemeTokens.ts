// 차트/네이티브 prop 등 className을 쓸 수 없는 지점용 테마 토큰 훅 (design §2).
// 스크린/컴포넌트의 일반 스타일링은 NativeWind className + dark: variant를 사용한다.
import { useColorScheme } from 'nativewind';
import { lightTokens, darkTokens, IThemeTokens } from '@/shared/config/theme';

export interface IUseThemeTokensResult {
  tokens: IThemeTokens;
  isDark: boolean;
}

export const useThemeTokens = (): IUseThemeTokensResult => {
  const { colorScheme: scheme } = useColorScheme();
  const isDark = scheme === 'dark';
  return { tokens: isDark ? darkTokens : lightTokens, isDark };
};
