// expo-haptics 래퍼 (F-013)
// 사용처: 관심 단지 토글(등록 impactMedium / 해제 impactLight),
// 탭 전환·차트 기간 토글(selection), 상한 초과 등 경고(warning).
// 모든 호출은 fire-and-forget — 햅틱 실패가 UX 흐름을 깨지 않도록 silently swallow.
import * as Haptics from 'expo-haptics';

const safely = (run: () => Promise<void>): void => {
  run().catch(() => {
    // 햅틱 미지원 기기/시뮬레이터 — 무시
  });
};

export const haptics = {
  /** 세그먼트/탭 전환, 차트 기간 토글 등 가벼운 선택 피드백 */
  selection: (): void => safely(() => Haptics.selectionAsync()),

  /** 관심 단지 해제 등 가벼운 액션 */
  impactLight: (): void =>
    safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** 관심 단지 등록 등 의미 있는 액션 */
  impactMedium: (): void =>
    safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** 작업 성공 알림 */
  success: (): void =>
    safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** 상한 초과 등 경고 */
  warning: (): void =>
    safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** 실패/에러 알림 */
  error: (): void =>
    safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
} as const;
