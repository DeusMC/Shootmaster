import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { GameColors, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TerrainChunk {
  id: string;
  x: number;
  y: number;
  type: "grass" | "rock" | "sand";
}

function generateTerrain(centerX: number, centerY: number): TerrainChunk[] {
  const chunks: TerrainChunk[] = [];
  const chunkSize = 100;
  const viewRange = 3;

  for (let dx = -viewRange; dx <= viewRange; dx++) {
    for (let dy = -viewRange; dy <= viewRange; dy++) {
      const x = Math.floor(centerX / chunkSize) + dx;
      const y = Math.floor(centerY / chunkSize) + dy;
      const seed = x * 1000 + y;
      const types: Array<"grass" | "rock" | "sand"> = ["grass", "rock", "sand"];
      const type = types[Math.abs(seed) % 3];

      chunks.push({
        id: `${x}_${y}`,
        x: x * chunkSize,
        y: y * chunkSize,
        type,
      });
    }
  }

  return chunks;
}

function TerrainElement({ chunk }: { chunk: TerrainChunk }) {
  const colors = {
    grass: "#1A4D2E",
    rock: "#4A5568",
    sand: "#D69E2E",
  };

  return (
    <View
      style={[
        styles.terrainChunk,
        {
          backgroundColor: colors[chunk.type],
          left: `${((chunk.x % 300) / 300) * 100}%`,
          top: `${((chunk.y % 300) / 300) * 100}%`,
        },
      ]}
    />
  );
}

function GridOverlay() {
  return (
    <View style={styles.gridOverlay}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={`h_${i}`} style={[styles.gridLine, { top: `${i * 10}%` }]} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={`v_${i}`}
          style={[styles.gridLine, styles.gridLineVertical, { left: `${i * 10}%` }]}
        />
      ))}
    </View>
  );
}

function AnimatedSkybox() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.skybox, animatedStyle]}>
      <View style={[styles.star, { top: "10%", left: "20%" }]} />
      <View style={[styles.star, { top: "30%", left: "70%" }]} />
      <View style={[styles.star, { top: "50%", left: "40%" }]} />
      <View style={[styles.star, { top: "15%", left: "85%" }]} />
      <View style={[styles.star, { top: "70%", left: "25%" }]} />
      <View style={[styles.star, { top: "45%", left: "90%" }]} />
    </Animated.View>
  );
}

function PlayerMarker() {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.playerContainer}>
      <Animated.View style={[styles.playerOuter, animatedStyle]} />
      <View style={styles.playerInner} />
      <View style={styles.playerDirection} />
    </View>
  );
}

function EnemyMarkers() {
  const enemies = [
    { id: 1, x: 30, y: 25 },
    { id: 2, x: 70, y: 60 },
    { id: 3, x: 45, y: 80 },
  ];

  return (
    <>
      {enemies.map((enemy) => (
        <View
          key={enemy.id}
          style={[
            styles.enemyMarker,
            { left: `${enemy.x}%`, top: `${enemy.y}%` },
          ]}
        />
      ))}
    </>
  );
}

function ObjectiveMarker() {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.8 + pulse.value * 0.4 }],
  }));

  return (
    <Animated.View style={[styles.objectiveMarker, animatedStyle]}>
      <View style={styles.objectiveInner} />
    </Animated.View>
  );
}

export function GameRenderer() {
  const terrain = generateTerrain(0, 0);

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <AnimatedSkybox />
      </View>

      <View style={styles.terrainContainer}>
        {terrain.slice(0, 12).map((chunk) => (
          <TerrainElement key={chunk.id} chunk={chunk} />
        ))}
      </View>

      <GridOverlay />

      <View style={styles.gameObjects}>
        <ObjectiveMarker />
        <EnemyMarkers />
        <PlayerMarker />
      </View>

      <View style={styles.horizon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  skybox: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    position: "absolute",
    top: -SCREEN_HEIGHT / 2,
    left: -SCREEN_WIDTH / 2,
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: GameColors.textPrimary,
    borderRadius: 1,
    opacity: 0.6,
  },
  terrainContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  terrainChunk: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    opacity: 0.4,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GameColors.primary,
  },
  gridLineVertical: {
    width: 1,
    height: "100%",
    left: undefined,
    right: undefined,
  },
  gameObjects: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  playerOuter: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GameColors.primary,
    opacity: 0.5,
  },
  playerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GameColors.primary,
  },
  playerDirection: {
    position: "absolute",
    top: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: GameColors.primary,
  },
  enemyMarker: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GameColors.danger,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  objectiveMarker: {
    position: "absolute",
    top: "20%",
    right: "25%",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: GameColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  objectiveInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GameColors.accent,
  },
  horizon: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: GameColors.primary,
    opacity: 0.2,
  },
});
