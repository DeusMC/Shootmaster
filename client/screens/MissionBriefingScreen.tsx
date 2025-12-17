import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGameState } from "@/game/GameState";
import { generateMission, Mission } from "@/game/MissionGenerator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MissionBriefing">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      onPress={() => {
        if (!disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }
      }}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        if (!disabled) scale.value = withSpring(1);
      }}
      style={[
        styles.actionButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        animatedStyle,
      ]}
    >
      <ThemedText
        type="h4"
        style={[styles.buttonText, !isPrimary && styles.secondaryButtonText]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function MissionBriefingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useGameState();
  const [mission, setMission] = useState<Mission | null>(state.currentMission);
  const [loading, setLoading] = useState(!state.currentMission);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.currentMission) {
      loadNewMission();
    }
  }, []);

  const loadNewMission = async () => {
    setLoading(true);
    setError(null);
    try {
      const newMission = await generateMission({
        playerLevel: state.playerLevel,
        x: state.position.x,
        y: state.position.y,
      });
      setMission(newMission);
    } catch (err) {
      setError("Failed to generate mission. Try again.");
      setMission({
        id: Date.now().toString(),
        title: "Patrol Mission",
        objective: "Eliminate hostile forces in the sector and secure the perimeter.",
        reward: 500,
        targetNPC: "Enemy Commander",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (mission) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch({ type: "SET_MISSION", payload: mission });
      navigation.goBack();
    }
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDecline} />
      <Animated.View
        entering={SlideInUp.springify().damping(15)}
        style={[
          styles.card,
          {
            marginTop: insets.top + Spacing["3xl"],
            marginBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <View style={styles.header}>
          <Feather name="radio" size={24} color={GameColors.accent} />
          <ThemedText type="caption" style={styles.headerLabel}>
            INCOMING TRANSMISSION
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GameColors.accent} />
            <ThemedText type="body" style={styles.loadingText}>
              Generating Mission...
            </ThemedText>
          </View>
        ) : mission ? (
          <Animated.View entering={FadeIn.delay(200)}>
            <ThemedText type="h3" style={styles.missionTitle}>
              {mission.title}
            </ThemedText>

            <View style={styles.section}>
              <ThemedText type="caption" style={styles.sectionLabel}>
                OBJECTIVE
              </ThemedText>
              <ThemedText type="body" style={styles.sectionText}>
                {mission.objective}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="caption" style={styles.sectionLabel}>
                TARGET
              </ThemedText>
              <View style={styles.targetRow}>
                <Feather name="crosshair" size={18} color={GameColors.danger} />
                <ThemedText type="body" style={styles.targetText}>
                  {mission.targetNPC}
                </ThemedText>
              </View>
            </View>

            <View style={styles.rewardContainer}>
              <Feather name="award" size={20} color={GameColors.accent} />
              <ThemedText type="h4" style={styles.rewardText}>
                {mission.reward} Credits
              </ThemedText>
            </View>
          </Animated.View>
        ) : null}

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <ActionButton label="Decline" onPress={handleDecline} variant="secondary" />
          <ActionButton
            label="Accept"
            onPress={handleAccept}
            variant="primary"
            disabled={loading || !mission}
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
    borderColor: GameColors.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerLabel: {
    color: GameColors.accent,
    letterSpacing: 2,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.lg,
  },
  loadingText: {
    color: GameColors.textSecondary,
  },
  missionTitle: {
    color: GameColors.textPrimary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    color: GameColors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  sectionText: {
    color: GameColors.textPrimary,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  targetText: {
    color: GameColors.danger,
    fontWeight: "600",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: `${GameColors.accent}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  rewardText: {
    color: GameColors.accent,
  },
  errorText: {
    color: GameColors.danger,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: GameColors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: GameColors.textSecondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: GameColors.textPrimary,
  },
  secondaryButtonText: {
    color: GameColors.textSecondary,
  },
});
