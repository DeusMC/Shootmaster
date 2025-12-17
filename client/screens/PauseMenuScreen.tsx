import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "PauseMenu">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  delay?: number;
}

function MenuItem({ icon, label, onPress, delay = 0 }: MenuItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(delay)}>
      <AnimatedPressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.menuItem, animatedStyle]}
      >
        <Feather name={icon} size={24} color={GameColors.textPrimary} />
        <ThemedText type="h4" style={styles.menuItemText}>
          {label}
        </ThemedText>
        <Feather name="chevron-right" size={24} color={GameColors.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function PauseMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
      />
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[
          styles.card,
          {
            marginTop: insets.top + Spacing["3xl"],
            marginBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          PAUSED
        </ThemedText>

        <View style={styles.menuItems}>
          <MenuItem
            icon="play"
            label="Resume"
            onPress={() => navigation.goBack()}
            delay={50}
          />
          <MenuItem
            icon="box"
            label="Inventory"
            onPress={() => {
              navigation.goBack();
              setTimeout(() => navigation.navigate("Inventory"), 100);
            }}
            delay={100}
          />
          <MenuItem
            icon="target"
            label="Current Mission"
            onPress={() => {
              navigation.goBack();
              setTimeout(() => navigation.navigate("MissionBriefing", {}), 100);
            }}
            delay={150}
          />
          <MenuItem
            icon="settings"
            label="Settings"
            onPress={() => {
              navigation.goBack();
              setTimeout(() => navigation.navigate("Settings"), 100);
            }}
            delay={200}
          />
          <MenuItem
            icon="log-out"
            label="Exit to Menu"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainMenu" }],
              });
            }}
            delay={250}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    width: "100%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  title: {
    color: GameColors.textPrimary,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: Spacing["2xl"],
  },
  menuItems: {
    gap: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${GameColors.background}80`,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    color: GameColors.textPrimary,
  },
});
