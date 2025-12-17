import React, { useState } from "react";
import { View, StyleSheet, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  type?: "switch" | "button" | "select";
  selectValue?: string;
  onPress?: () => void;
  delay?: number;
}

function SettingRow({
  icon,
  label,
  value,
  onValueChange,
  type = "switch",
  selectValue,
  onPress,
  delay = 0,
}: SettingRowProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <Pressable
        onPress={() => {
          if (type === "button" || type === "select") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress?.();
          }
        }}
        style={styles.settingRow}
      >
        <Feather name={icon} size={20} color={GameColors.textSecondary} />
        <ThemedText type="body" style={styles.settingLabel}>
          {label}
        </ThemedText>
        {type === "switch" ? (
          <Switch
            value={value}
            onValueChange={(newValue) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onValueChange?.(newValue);
            }}
            trackColor={{ false: GameColors.textSecondary, true: GameColors.primary }}
            thumbColor={GameColors.textPrimary}
          />
        ) : null}
        {type === "select" ? (
          <View style={styles.selectContainer}>
            <ThemedText type="small" style={styles.selectValue}>
              {selectValue}
            </ThemedText>
            <Feather name="chevron-right" size={18} color={GameColors.textSecondary} />
          </View>
        ) : null}
        {type === "button" ? (
          <Feather name="chevron-right" size={18} color={GameColors.textSecondary} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function SettingSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.section}>
      <ThemedText type="caption" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.sectionContent}>{children}</View>
    </Animated.View>
  );
}

function Slider({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleDecrease = () => {
    const newValue = Math.max(0, localValue - 0.1);
    setLocalValue(newValue);
    onValueChange(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncrease = () => {
    const newValue = Math.min(1, localValue + 0.1);
    setLocalValue(newValue);
    onValueChange(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.sliderRow}>
      <ThemedText type="body" style={styles.sliderLabel}>
        {label}
      </ThemedText>
      <View style={styles.sliderControls}>
        <Pressable onPress={handleDecrease} style={styles.sliderButton}>
          <Feather name="minus" size={18} color={GameColors.textPrimary} />
        </Pressable>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${localValue * 100}%` }]} />
        </View>
        <Pressable onPress={handleIncrease} style={styles.sliderButton}>
          <Feather name="plus" size={18} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText type="small" style={styles.sliderValue}>
          {Math.round(localValue * 100)}%
        </ThemedText>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [graphicsQuality, setGraphicsQuality] = useState("Medium");
  const [sensitivity, setSensitivity] = useState(0.5);
  const [masterVolume, setMasterVolume] = useState(0.8);

  const qualityOptions = ["Low", "Medium", "High"];
  const cycleQuality = () => {
    const currentIndex = qualityOptions.indexOf(graphicsQuality);
    const nextIndex = (currentIndex + 1) % qualityOptions.length;
    setGraphicsQuality(qualityOptions[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <SettingSection title="PROFILE" delay={0}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={32} color={GameColors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="h4" style={styles.profileName}>
                Operator
              </ThemedText>
              <ThemedText type="small" style={styles.profileLevel}>
                Level 1
              </ThemedText>
            </View>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.editButton}
            >
              <Feather name="edit-2" size={18} color={GameColors.accent} />
            </Pressable>
          </View>
        </SettingSection>

        <SettingSection title="GRAPHICS" delay={100}>
          <SettingRow
            icon="monitor"
            label="Quality"
            type="select"
            selectValue={graphicsQuality}
            onPress={cycleQuality}
          />
        </SettingSection>

        <SettingSection title="CONTROLS" delay={200}>
          <Slider
            label="Sensitivity"
            value={sensitivity}
            onValueChange={setSensitivity}
          />
          <SettingRow
            icon="smartphone"
            label="Haptic Feedback"
            value={hapticEnabled}
            onValueChange={setHapticEnabled}
          />
        </SettingSection>

        <SettingSection title="AUDIO" delay={300}>
          <Slider
            label="Master Volume"
            value={masterVolume}
            onValueChange={setMasterVolume}
          />
          <SettingRow
            icon="volume-2"
            label="Sound Effects"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
          <SettingRow
            icon="music"
            label="Music"
            value={musicEnabled}
            onValueChange={setMusicEnabled}
          />
        </SettingSection>

        <SettingSection title="ABOUT" delay={400}>
          <SettingRow icon="info" label="Version 1.0.0" type="button" />
          <SettingRow icon="file-text" label="Privacy Policy" type="button" />
          <SettingRow icon="help-circle" label="Help & Support" type="button" />
        </SettingSection>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${GameColors.textSecondary}10`,
  },
  settingLabel: {
    flex: 1,
    color: GameColors.textPrimary,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  selectValue: {
    color: GameColors.accent,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: GameColors.textPrimary,
  },
  profileLevel: {
    color: GameColors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.accent}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderRow: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${GameColors.textSecondary}10`,
  },
  sliderLabel: {
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.primary}40`,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: `${GameColors.background}80`,
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: GameColors.primary,
    borderRadius: 4,
  },
  sliderValue: {
    color: GameColors.textSecondary,
    width: 40,
    textAlign: "right",
  },
});
