import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import MainMenuScreen from "@/screens/MainMenuScreen";
import GameWorldScreen from "@/screens/GameWorldScreen";
import PauseMenuScreen from "@/screens/PauseMenuScreen";
import MissionBriefingScreen from "@/screens/MissionBriefingScreen";
import InventoryScreen from "@/screens/InventoryScreen";
import SettingsScreen from "@/screens/SettingsScreen";

export type RootStackParamList = {
  MainMenu: undefined;
  GameWorld: undefined;
  PauseMenu: undefined;
  MissionBriefing: { missionId?: string };
  Inventory: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        ...screenOptions,
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="MainMenu" component={MainMenuScreen} />
      <Stack.Screen name="GameWorld" component={GameWorldScreen} />
      <Stack.Screen
        name="PauseMenu"
        component={PauseMenuScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="MissionBriefing"
        component={MissionBriefingScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "LOADOUT",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Settings",
        }}
      />
    </Stack.Navigator>
  );
}
