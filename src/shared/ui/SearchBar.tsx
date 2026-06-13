// 검색 입력 프리미티브 (nativewind-theme.md §4.4).
// SearchBar: 실제 입력 / FakeSearchBar: 동일 룩의 Pressable (홈 → 검색 탭 진입 트리거).
import { useState } from 'react';
import { View, TextInput, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';
import { AppText } from './Typography';

const DEFAULT_PLACEHOLDER = '단지명 또는 지역 검색';
const CLEAR_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;

interface ISearchBarProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = DEFAULT_PLACEHOLDER,
  className,
  ...rest
}: ISearchBarProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = isFocused
    ? 'border border-primary-600 dark:border-primary-400'
    : 'border border-transparent';

  return (
    <View
      className={`h-12 flex-row items-center rounded-xl bg-field px-3.5 dark:bg-field-dark ${borderClass} ${className ?? ''}`}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? tokens.primary : tokens.textTertiary}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.textTertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="검색어 입력"
        className="ml-2 flex-1 text-body text-ink dark:text-ink-dark"
        {...rest}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={CLEAR_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
        >
          <Ionicons name="close-circle" size={18} color={tokens.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

interface IFakeSearchBarProps {
  onPress: () => void;
  placeholder?: string;
  className?: string;
}

/** 홈 상단 가짜 검색바 — 동일 룩, 탭 시 검색 화면으로 이동 */
export function FakeSearchBar({
  onPress,
  placeholder = DEFAULT_PLACEHOLDER,
  className,
}: IFakeSearchBarProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="단지 또는 지역 검색"
      className={`h-12 flex-row items-center rounded-xl bg-field px-3.5 active:opacity-85 dark:bg-field-dark ${className ?? ''}`}
    >
      <Ionicons name="search" size={20} color={tokens.textTertiary} />
      <AppText variant="body" tone="faint" className="ml-2">
        {placeholder}
      </AppText>
    </Pressable>
  );
}
