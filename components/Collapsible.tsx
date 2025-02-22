import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, Animated, View, Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import GradientBorder from "./ui/GradientBorder";
import colors from "@/utils/colors";

export function Collapsible({
  children,
  title,
  condensed = false,
}: PropsWithChildren & { title: string; condensed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemedView>
      <GradientBorder>
        <TouchableOpacity
          style={[
            styles.heading,
            {
              padding: condensed ? 4 : 10,
              borderBottomWidth: condensed ? 0 : 1,
            },
          ]}
          onPress={() => setIsOpen((value) => !value)}
          activeOpacity={0.9}
        >
          <IconSymbol
            name={condensed ? "info" : "chevron.right"}
            size={18}
            weight="medium"
            color={colors.textPrimary}
            style={{
              transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
            }}
          />
          <ThemedText
            type="glow"
            darkColor={colors.textPrimary}
            style={styles.title}
          >
            {title}
          </ThemedText>
        </TouchableOpacity>
      </GradientBorder>
      {isOpen && (
        <ThemedView style={styles.content}>
          <View>{children}</View>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Platform.OS === "ios" ? colors.iosTransparentBackground : colors.transparentBackground, // Solid color for iOS
    borderBottomColor: colors.border,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    backgroundColor: colors.panelBackground,
    paddingVertical: 6
  },
});

export default Collapsible;
