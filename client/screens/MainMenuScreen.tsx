import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MainMenu">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MenuButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.iconButton, animatedStyle]}
    >
      <Feather name={icon} size={24} color={GameColors.textPrimary} />
    </AnimatedPressable>
  );
}

export default function MainMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStartMission = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate("GameWorld");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GameColors.background, "#0F1835", GameColors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.header}>
          <Image
            source={require("@assets/images/icon.png")}
            style={styles.logo}
          />
          <ThemedText type="h1" style={styles.title}>
            TACTICAL OPS
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Open World Shooter
          </ThemedText>
        </View>

        <View style={styles.centerSection}>
          <Animated.View style={pulseStyle}>
            <AnimatedPressable
              onPress={handleStartMission}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
              style={[styles.startButton, buttonAnimatedStyle]}
            >
              <LinearGradient
                colors={[GameColors.primary, "#0D3320"]}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather
                  name="play"
                  size={32}
                  color={GameColors.textPrimary}
                />
                <ThemedText type="h3" style={styles.startButtonText}>
                  START MISSION
                </ThemedText>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        </View>

        <View
          style={[styles.bottomRow, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <MenuButton
            icon="settings"
            onPress={() => navigation.navigate("Settings")}
          />
          <MenuButton
            icon="bar-chart-2"
            onPress={() => navigation.navigate("Inventory")}
          />
          <MenuButton
            icon="info"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    color: GameColors.textPrimary,
    letterSpacing: 4,
  },
  subtitle: {
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  centerSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  startButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing["4xl"],
    gap: Spacing.md,
  },
  startButtonText: {
    color: GameColors.textPrimary,
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.surface}CC`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
});
