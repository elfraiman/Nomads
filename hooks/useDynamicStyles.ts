import { useColorScheme } from "@/hooks/useColorScheme.web";
import { StyleSheet } from "react-native";

export const useDynamicStyles = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

    return StyleSheet.create({
        container: {
            backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
        },
        text: {
            color: isDarkMode ? "#FFFFFF" : "#000000",
        },
    });
};
