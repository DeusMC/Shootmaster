import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { GameColors, BorderRadius } from "@/constants/theme";

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

export function VirtualJoystick({ onMove, size = JOYSTICK_SIZE }: VirtualJoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const handleMove = useCallback(
    (x: number, y: number) => {
      const normalizedX = x / MAX_DISTANCE;
      const normalizedY = y / MAX_DISTANCE;
      onMove(normalizedX, -normalizedY);
    },
    [onMove]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2
      );

      if (distance > MAX_DISTANCE) {
        const angle = Math.atan2(event.translationY, event.translationX);
        translateX.value = Math.cos(angle) * MAX_DISTANCE;
        translateY.value = Math.sin(angle) * MAX_DISTANCE;
      } else {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }

      runOnJS(handleMove)(translateX.value, translateY.value);
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      isActive.value = false;
      runOnJS(handleMove)(0, 0);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const baseStyle = useAnimatedStyle(() => ({
    opacity: isActive.value ? 1 : 0.7,
    borderColor: isActive.value ? GameColors.primary : `${GameColors.primary}80`,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.base, { width: size, height: size }, baseStyle]}>
        <View style={styles.directions}>
          <View style={[styles.directionLine, styles.directionUp]} />
          <View style={[styles.directionLine, styles.directionDown]} />
          <View style={[styles.directionLine, styles.directionLeft]} />
          <View style={[styles.directionLine, styles.directionRight]} />
        </View>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    backgroundColor: `${GameColors.surface}80`,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  directions: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  directionLine: {
    position: "absolute",
    backgroundColor: `${GameColors.primary}40`,
  },
  directionUp: {
    width: 2,
    height: 20,
    top: 15,
  },
  directionDown: {
    width: 2,
    height: 20,
    bottom: 15,
  },
  directionLeft: {
    width: 20,
    height: 2,
    left: 15,
  },
  directionRight: {
    width: 20,
    height: 2,
    right: 15,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: GameColors.primary,
    borderWidth: 3,
    borderColor: `${GameColors.textPrimary}80`,
  },
});
