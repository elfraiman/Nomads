import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import GradientBorder from './ui/GradientBorder';

export function Collapsible({ children, title, condensed = false }: PropsWithChildren & { title: string, condensed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <GradientBorder>
        <TouchableOpacity
          style={{ ...styles.heading, padding: condensed ? 0 : 6, borderBottomWidth: condensed ? 0 : 1 }}
          onPress={() => setIsOpen((value) => !value)}
          activeOpacity={0.8}>

          <IconSymbol
            name={condensed ? 'info' : 'chevron.right'}
            size={18}
            weight="medium"
            color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />
          <ThemedText type="glow" darkColor='#DFAA30'>{title}</ThemedText>
        </TouchableOpacity>
        {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
      </GradientBorder>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    borderBottomWidth: 1,
    padding: 6,
  },
  content: {
    padding: 6
  },
});
