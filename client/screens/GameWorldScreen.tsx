import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius, HUDStyles } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGameState, GameStateProvider } from "@/game/GameState";
import { GunController, GunFactory } from "@/game/GunController";
import { GameRenderer } from "@/game/GameRenderer";
import { VirtualJoystick } from "@/components/VirtualJoystick";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "GameWorld">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function HUDButton({
  icon,
  onPress,
  style,
  size = 24,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: any;
  size?: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.hudButton, animatedStyle, style]}
    >
      <Feather name={icon} size={size} color={GameColors.textPrimary} />
    </AnimatedPressable>
  );
}

function HealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  const percentage = (health / maxHealth) * 100;
  const barColor = percentage > 50 ? GameColors.primary : percentage > 25 ? GameColors.accent : GameColors.danger;

  return (
    <View style={styles.healthContainer}>
      <Feather name="heart" size={16} color={barColor} />
      <View style={styles.healthBarOuter}>
        <View style={[styles.healthBarInner, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
      <ThemedText type="small" style={styles.healthText}>
        {health}/{maxHealth}
      </ThemedText>
    </View>
  );
}

function AmmoCounter({ current, max }: { current: number; max: number }) {
  const isLow = current <= Math.floor(max * 0.25);

  return (
    <View style={styles.ammoContainer}>
      <Feather name="target" size={16} color={isLow ? GameColors.secondary : GameColors.textPrimary} />
      <ThemedText
        type="mono"
        style={[styles.ammoText, isLow && { color: GameColors.secondary }]}
      >
        {current}/{max}
      </ThemedText>
    </View>
  );
}

function MissionObjective({ objective, collapsed, onToggle }: { objective: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.missionContainer}>
      <View style={styles.missionHeader}>
        <Feather name="target" size={14} color={GameColors.accent} />
        <ThemedText type="caption" style={styles.missionLabel}>
          OBJECTIVE
        </ThemedText>
        <Feather name={collapsed ? "chevron-down" : "chevron-up"} size={14} color={GameColors.textSecondary} />
      </View>
      {!collapsed ? (
        <ThemedText type="small" style={styles.missionText} numberOfLines={2}>
          {objective}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

function MiniMap() {
  const radarPulse = useSharedValue(0);

  useEffect(() => {
    radarPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + radarPulse.value * 0.5 }],
    opacity: 1 - radarPulse.value,
  }));

  return (
    <View style={styles.miniMapContainer}>
      <View style={styles.miniMapInner}>
        <View style={styles.miniMapGrid} />
        <Animated.View style={[styles.radarPulse, pulseStyle]} />
        <View style={styles.playerDot} />
        <View style={[styles.npcDot, { top: "30%", left: "60%" }]} />
        <View style={[styles.npcDot, { top: "70%", left: "40%" }]} />
      </View>
    </View>
  );
}

function GameWorldContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useGameState();
  const [objectiveCollapsed, setObjectiveCollapsed] = useState(false);
  const gunController = useRef(GunFactory.createPreset("rifle")).current;

  const handleShoot = useCallback(() => {
    if (state.ammo > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      dispatch({ type: "SHOOT" });
      gunController.fire();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [state.ammo, gunController]);

  const handleReload = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: "RELOAD" });
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    dispatch({ type: "MOVE", payload: { x, y } });
  }, []);

  const handleWeaponSwitch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Inventory");
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!state.currentMission) {
        const timer = setTimeout(() => {
          navigation.navigate("MissionBriefing", {});
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [state.currentMission, navigation])
  );

  return (
    <View style={styles.container}>
      <GameRenderer />

      <View style={[styles.hudTop, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.hudTopLeft}>
          <HealthBar health={state.health} maxHealth={state.maxHealth} />
          <AmmoCounter current={state.ammo} max={state.maxAmmo} />
          <MiniMap />
        </View>
        <View style={styles.hudTopCenter}>
          <HUDButton icon="pause" onPress={() => navigation.navigate("PauseMenu")} />
        </View>
        <View style={styles.hudTopRight}>
          <MissionObjective
            objective={state.currentMission?.objective || "Accept a mission to begin"}
            collapsed={objectiveCollapsed}
            onToggle={() => setObjectiveCollapsed(!objectiveCollapsed)}
          />
        </View>
      </View>

      <View style={[styles.hudBottom, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.hudBottomLeft}>
          <VirtualJoystick onMove={handleMove} />
        </View>
        <View style={styles.hudBottomRight}>
          <HUDButton
            icon="refresh-cw"
            onPress={handleReload}
            style={styles.reloadButton}
            size={20}
          />
          <Pressable
            onPress={handleShoot}
            style={({ pressed }) => [
              styles.shootButton,
              pressed && styles.shootButtonPressed,
            ]}
          >
            <View style={styles.crosshair}>
              <View style={styles.crosshairLine} />
              <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
              <View style={styles.crosshairDot} />
            </View>
          </Pressable>
          <HUDButton
            icon="box"
            onPress={handleWeaponSwitch}
            style={styles.weaponButton}
            size={20}
          />
        </View>
      </View>
    </View>
  );
}

export default function GameWorldScreen() {
  return (
    <GameStateProvider>
      <GameWorldContent />
    </GameStateProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  hudTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  hudTopLeft: {
    gap: Spacing.sm,
  },
  hudTopCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    top: 0,
    paddingTop: Spacing.md,
  },
  hudTopRight: {
    maxWidth: "40%",
  },
  hudBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    alignItems: "flex-end",
  },
  hudBottomLeft: {},
  hudBottomRight: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  hudButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.surface}${Math.round(HUDStyles.panelOpacity * 255).toString(16)}`,
    borderWidth: HUDStyles.borderWidth,
    borderColor: GameColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  healthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: `${GameColors.surface}${Math.round(HUDStyles.panelOpacity * 255).toString(16)}`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: HUDStyles.borderWidth,
    borderColor: GameColors.primary,
  },
  healthBarOuter: {
    width: 80,
    height: 8,
    backgroundColor: `${GameColors.background}80`,
    borderRadius: 4,
    overflow: "hidden",
  },
  healthBarInner: {
    height: "100%",
    borderRadius: 4,
  },
  healthText: {
    color: GameColors.textPrimary,
    minWidth: 50,
    textAlign: "right",
  },
  ammoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: `${GameColors.surface}${Math.round(HUDStyles.panelOpacity * 255).toString(16)}`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: HUDStyles.borderWidth,
    borderColor: GameColors.secondary,
  },
  ammoText: {
    color: GameColors.textPrimary,
  },
  missionContainer: {
    backgroundColor: `${GameColors.surface}${Math.round(HUDStyles.panelOpacity * 255).toString(16)}`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: HUDStyles.borderWidth,
    borderColor: GameColors.accent,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  missionLabel: {
    color: GameColors.accent,
    flex: 1,
    letterSpacing: 1,
  },
  missionText: {
    color: GameColors.textPrimary,
    marginTop: Spacing.xs,
  },
  miniMapContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.surface}${Math.round(HUDStyles.panelOpacity * 255).toString(16)}`,
    borderWidth: HUDStyles.borderWidth,
    borderColor: GameColors.primary,
    overflow: "hidden",
    marginTop: Spacing.xs,
  },
  miniMapInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  miniMapGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: `${GameColors.primary}40`,
  },
  radarPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GameColors.primary,
  },
  npcDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GameColors.danger,
  },
  shootButton: {
    width: HUDStyles.controlSize * 1.5,
    height: HUDStyles.controlSize * 1.5,
    borderRadius: HUDStyles.controlSize * 0.75,
    backgroundColor: `${GameColors.secondary}CC`,
    borderWidth: 3,
    borderColor: GameColors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  shootButtonPressed: {
    backgroundColor: GameColors.secondary,
    transform: [{ scale: 0.95 }],
  },
  crosshair: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: GameColors.textPrimary,
  },
  crosshairLineVertical: {
    width: 2,
    height: 20,
  },
  crosshairDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GameColors.textPrimary,
  },
  reloadButton: {
    borderColor: GameColors.accent,
  },
  weaponButton: {
    borderColor: GameColors.textSecondary,
  },
});
