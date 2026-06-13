// 하단 탭 3개 — 홈/검색/설정 (01-foundation). 탭 전환 햅틱 selection (F-013).
// 탭바: surface 배경 + hairline 보더, 활성 primary / 비활성 faint (screen-layouts.md §0).
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeTokens, haptics } from '@/shared/lib';

type TIoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ITabIconProps {
  name: TIoniconName;
  color: string;
  size: number;
}

function TabIcon({ name, color, size }: ITabIconProps): React.JSX.Element {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout(): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.primary,
        tabBarInactiveTintColor: tokens.textTertiary,
        tabBarStyle: {
          backgroundColor: tokens.surface,
          borderTopColor: tokens.line,
          borderTopWidth: 1,
        },
      }}
      screenListeners={{
        tabPress: () => {
          haptics.selection();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color, size }) => <TabIcon name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
