/** 테마 모드 (F-009: system_with_toggle) */
export enum EThemeMode {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark',
}

/** 테마 모드 문자열 리터럴 — NativeWind colorScheme.set 호환 */
export type TThemeMode = `${EThemeMode}`;
