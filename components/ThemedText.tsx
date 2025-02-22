import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import colors from '@/utils/colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'glow';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'glow' ? styles.glow : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  defaultSemiBold: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '600',
  },
  glow: {
    fontSize: 14, // Adjust based on your text size
    textShadowColor: '#bd650b', // Glow color (e.g., golden glow)
    textShadowOffset: { width: 0, height: 0 }, // No offset, shadow directly behind text
    textShadowRadius: 4, // Adjust for stronger or softer glow
    color: colors.textPrimary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    color: '#0a7ea4',
  },
});
