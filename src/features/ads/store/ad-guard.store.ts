// 배너 클릭 가드 store (무효 트래픽 방지 — AdMob 계정 정지 방어).
// 일일 클릭 5회 초과 시 24시간 동안 배너 렌더링 자체를 차단한다 (PRD §6).
// 비민감 카운터 — AsyncStorage persist 허용. 날짜 키는 dayjs 로컬 기준 (Hard Threshold).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { ADS_CONFIG } from '@/shared/config';

interface IAdGuardState {
  /** 클릭 카운트 기준 날짜 (YYYY-MM-DD, 로컬) — 날짜가 바뀌면 카운트 리셋 */
  clickDateKey: string;
  /** 오늘 누적 배너 클릭 수 */
  clickCount: number;
  /** 이 시각(ISO)까지 배너 렌더링 차단. null이면 정상 */
  suppressedUntil: string | null;
  /** AdBanner onAdClicked에서 호출 — 한도 초과 시 자동으로 숨김 발동 */
  recordBannerClick: () => void;
  /** 배너 렌더 가드 — true면 AdBanner가 마운트하지 않는다 */
  isBannerSuppressed: () => boolean;
}

const todayKey = (): string => dayjs().format('YYYY-MM-DD');

export const useAdGuardStore = create<IAdGuardState>()(
  persist(
    (set, get) => ({
      clickDateKey: todayKey(),
      clickCount: 0,
      suppressedUntil: null,

      recordBannerClick: () => {
        const { clickDateKey, clickCount } = get();
        const today = todayKey();
        const nextCount = clickDateKey === today ? clickCount + 1 : 1;

        if (nextCount > ADS_CONFIG.BANNER_CLICK_DAILY_LIMIT) {
          set({
            clickDateKey: today,
            clickCount: nextCount,
            suppressedUntil: dayjs().add(ADS_CONFIG.BANNER_SUPPRESS_HOURS, 'hour').toISOString(),
          });
          return;
        }
        set({ clickDateKey: today, clickCount: nextCount });
      },

      isBannerSuppressed: () => {
        const { suppressedUntil } = get();
        if (!suppressedUntil) return false;
        if (dayjs().isBefore(dayjs(suppressedUntil))) return true;
        // 숨김 기간 만료 — 상태 정리 후 정상 렌더 허용
        set({ suppressedUntil: null, clickCount: 0, clickDateKey: todayKey() });
        return false;
      },
    }),
    {
      name: 'ad-guard-store', // 비민감 — AsyncStorage 허용
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
