import { StyleSheet } from 'react-native';
import colors from '@/utils/colors';

export const weaponStyles = StyleSheet.create({
  weaponItem: {
    backgroundColor: 'rgba(20, 30, 50, 0.9)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A4C7A',
  },
  weaponItemContent: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 4,
  },
  weaponName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  resourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  costText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  upgradeButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    elevation: 3,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#2A3A4A',
    opacity: 0.7,
  },
  craftButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: 'center',
  },
}); 