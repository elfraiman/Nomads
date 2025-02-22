import colors from '@/utils/colors';
import { StyleSheet } from 'react-native';

export const panelStyles = StyleSheet.create({
  quickActionsPanel: {
    backgroundColor: 'rgba(16, 24, 48, 0.8)',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A4C7A',
  },
  modulePanel: {
    backgroundColor: 'rgba(16, 24, 48, 0.8)',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collapsibleCustom: {
    backgroundColor: 'rgba(30, 40, 60, 0.8)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2A4C7A',
  },
}); 