import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { GunFactory, GunStats } from "@/game/GunController";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WeaponData {
  id: string;
  name: string;
  type: "pistol" | "rifle" | "shotgun" | "sniper";
  stats: GunStats;
  unlocked: boolean;
}

const weapons: WeaponData[] = [
  {
    id: "pistol",
    name: "M9 Pistol",
    type: "pistol",
    stats: GunFactory.createPreset("pistol").getStats(),
    unlocked: true,
  },
  {
    id: "rifle",
    name: "M4A1 Rifle",
    type: "rifle",
    stats: GunFactory.createPreset("rifle").getStats(),
    unlocked: true,
  },
  {
    id: "shotgun",
    name: "M870 Shotgun",
    type: "shotgun",
    stats: {
      damage: 80,
      fireRate: 1,
      recoil: 0.8,
      spread: 0.3,
      magazineSize: 8,
      reloadTime: 2500,
    },
    unlocked: false,
  },
  {
    id: "sniper",
    name: "M24 Sniper",
    type: "sniper",
    stats: {
      damage: 120,
      fireRate: 0.5,
      recoil: 0.9,
      spread: 0.02,
      magazineSize: 5,
      reloadTime: 3000,
    },
    unlocked: false,
  },
];

const weaponIcons: Record<string, keyof typeof Feather.glyphMap> = {
  pistol: "target",
  rifle: "zap",
  shotgun: "maximize-2",
  sniper: "crosshair",
};

function StatBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.statRow}>
      <ThemedText type="caption" style={styles.statLabel}>
        {label}
      </ThemedText>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <ThemedText type="caption" style={styles.statValue}>
        {value.toFixed(1)}
      </ThemedText>
    </View>
  );
}

function WeaponCard({
  weapon,
  selected,
  onSelect,
  index,
}: {
  weapon: WeaponData;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <AnimatedPressable
        onPress={() => {
          if (weapon.unlocked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect();
          }
        }}
        onPressIn={() => {
          if (weapon.unlocked) scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          if (weapon.unlocked) scale.value = withSpring(1);
        }}
        style={[
          styles.weaponCard,
          selected && styles.weaponCardSelected,
          !weapon.unlocked && styles.weaponCardLocked,
          animatedStyle,
        ]}
      >
        <View style={styles.weaponIconContainer}>
          <Feather
            name={weaponIcons[weapon.type]}
            size={32}
            color={weapon.unlocked ? GameColors.textPrimary : GameColors.textSecondary}
          />
          {!weapon.unlocked ? (
            <View style={styles.lockIcon}>
              <Feather name="lock" size={16} color={GameColors.textSecondary} />
            </View>
          ) : null}
        </View>
        <ThemedText
          type="h4"
          style={[styles.weaponName, !weapon.unlocked && styles.lockedText]}
        >
          {weapon.name}
        </ThemedText>
        {weapon.unlocked ? (
          <ThemedText type="caption" style={styles.weaponType}>
            {weapon.type.toUpperCase()}
          </ThemedText>
        ) : (
          <ThemedText type="caption" style={styles.lockedText}>
            LOCKED
          </ThemedText>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponData>(weapons[1]);
  const [equippedId, setEquippedId] = useState("rifle");

  const handleEquip = () => {
    if (selectedWeapon.unlocked && selectedWeapon.id !== equippedId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEquippedId(selectedWeapon.id);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <View style={styles.currentWeapon}>
          <View style={styles.currentWeaponHeader}>
            <View style={styles.currentWeaponIcon}>
              <Feather
                name={weaponIcons[selectedWeapon.type]}
                size={48}
                color={GameColors.accent}
              />
            </View>
            <View style={styles.currentWeaponInfo}>
              <ThemedText type="h3" style={styles.currentWeaponName}>
                {selectedWeapon.name}
              </ThemedText>
              <ThemedText type="small" style={styles.currentWeaponType}>
                {selectedWeapon.type.toUpperCase()}
              </ThemedText>
              {equippedId === selectedWeapon.id ? (
                <View style={styles.equippedBadge}>
                  <ThemedText type="caption" style={styles.equippedText}>
                    EQUIPPED
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <StatBar
              label="Damage"
              value={selectedWeapon.stats.damage}
              maxValue={150}
              color={GameColors.danger}
            />
            <StatBar
              label="Fire Rate"
              value={selectedWeapon.stats.fireRate * 10}
              maxValue={15}
              color={GameColors.secondary}
            />
            <StatBar
              label="Accuracy"
              value={(1 - selectedWeapon.stats.spread) * 10}
              maxValue={10}
              color={GameColors.primary}
            />
            <StatBar
              label="Magazine"
              value={selectedWeapon.stats.magazineSize}
              maxValue={35}
              color={GameColors.accent}
            />
          </View>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Arsenal
        </ThemedText>

        <View style={styles.weaponsGrid}>
          {weapons.map((weapon, index) => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              selected={selectedWeapon.id === weapon.id}
              onSelect={() => setSelectedWeapon(weapon)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleEquip}
          style={({ pressed }) => [
            styles.equipButton,
            equippedId === selectedWeapon.id && styles.equipButtonDisabled,
            pressed && styles.equipButtonPressed,
          ]}
          disabled={equippedId === selectedWeapon.id || !selectedWeapon.unlocked}
        >
          <ThemedText type="h4" style={styles.equipButtonText}>
            {equippedId === selectedWeapon.id ? "EQUIPPED" : "EQUIP"}
          </ThemedText>
        </Pressable>
      </View>
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
  currentWeapon: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: GameColors.accent,
  },
  currentWeaponHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  currentWeaponIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: `${GameColors.accent}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  currentWeaponInfo: {
    flex: 1,
  },
  currentWeaponName: {
    color: GameColors.textPrimary,
  },
  currentWeaponType: {
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  equippedBadge: {
    backgroundColor: GameColors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
  },
  equippedText: {
    color: GameColors.textPrimary,
    letterSpacing: 1,
  },
  statsContainer: {
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statLabel: {
    color: GameColors.textSecondary,
    width: 70,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: `${GameColors.background}80`,
    borderRadius: 4,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    borderRadius: 4,
  },
  statValue: {
    color: GameColors.textPrimary,
    width: 30,
    textAlign: "right",
  },
  sectionTitle: {
    color: GameColors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: 1,
  },
  weaponsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  weaponCard: {
    width: "47%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  weaponCardSelected: {
    borderColor: GameColors.accent,
  },
  weaponCardLocked: {
    opacity: 0.5,
  },
  weaponIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.background}80`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  lockIcon: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
  },
  weaponName: {
    color: GameColors.textPrimary,
    textAlign: "center",
  },
  weaponType: {
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  lockedText: {
    color: GameColors.textSecondary,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: GameColors.surface,
    borderTopWidth: 1,
    borderTopColor: `${GameColors.textSecondary}20`,
  },
  equipButton: {
    backgroundColor: GameColors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  equipButtonDisabled: {
    backgroundColor: GameColors.textSecondary,
  },
  equipButtonPressed: {
    opacity: 0.8,
  },
  equipButtonText: {
    color: GameColors.textPrimary,
    letterSpacing: 2,
  },
});
