import { apiRequest } from "@/lib/query-client";

export interface Mission {
  id: string;
  title: string;
  objective: string;
  reward: number;
  targetNPC: string;
}

export interface PlayerStats {
  playerLevel: number;
  x: number;
  y: number;
}

const FALLBACK_MISSIONS: Mission[] = [
  {
    id: "fallback_1",
    title: "Sector Sweep",
    objective: "Clear all hostile forces from the designated sector and establish a safe perimeter.",
    reward: 500,
    targetNPC: "Enemy Commander",
  },
  {
    id: "fallback_2",
    title: "Intel Recovery",
    objective: "Locate and retrieve the encrypted data drive from the abandoned outpost.",
    reward: 750,
    targetNPC: "Intel Officer",
  },
  {
    id: "fallback_3",
    title: "High Value Target",
    objective: "Track and eliminate the enemy lieutenant before they escape the combat zone.",
    reward: 1000,
    targetNPC: "Lieutenant Voss",
  },
  {
    id: "fallback_4",
    title: "Supply Line Disruption",
    objective: "Intercept and destroy the enemy supply convoy approaching from the north.",
    reward: 600,
    targetNPC: "Convoy Leader",
  },
  {
    id: "fallback_5",
    title: "Rescue Operation",
    objective: "Extract the captured operative from the enemy stronghold before dawn.",
    reward: 850,
    targetNPC: "Prison Warden",
  },
];

function getRandomFallbackMission(playerLevel: number): Mission {
  const mission = FALLBACK_MISSIONS[Math.floor(Math.random() * FALLBACK_MISSIONS.length)];
  const levelMultiplier = 1 + (playerLevel - 1) * 0.2;

  return {
    ...mission,
    id: `${mission.id}_${Date.now()}`,
    reward: Math.round(mission.reward * levelMultiplier),
  };
}

export async function generateMission(playerStats: PlayerStats): Promise<Mission> {
  try {
    const response = await apiRequest("POST", "/api/generate-mission", {
      playerLevel: playerStats.playerLevel,
      coordinates: { x: playerStats.x, y: playerStats.y },
    });

    const data = await response.json();

    if (data.mission) {
      return {
        id: data.mission.id || Date.now().toString(),
        title: data.mission.title,
        objective: data.mission.objective,
        reward: data.mission.reward,
        targetNPC: data.mission.targetNPC,
      };
    }

    return getRandomFallbackMission(playerStats.playerLevel);
  } catch (error) {
    console.log("Mission generation failed, using fallback:", error);
    return getRandomFallbackMission(playerStats.playerLevel);
  }
}

export async function generateAIWeaponStats(): Promise<{
  damage: number;
  fireRate: number;
  recoil: number;
  spread: number;
  magazineSize: number;
  reloadTime: number;
}> {
  try {
    const response = await apiRequest("POST", "/api/generate-weapon", {});
    const data = await response.json();

    if (data.stats) {
      return data.stats;
    }

    return {
      damage: 25 + Math.random() * 50,
      fireRate: 2 + Math.random() * 8,
      recoil: 0.1 + Math.random() * 0.5,
      spread: 0.02 + Math.random() * 0.15,
      magazineSize: Math.floor(10 + Math.random() * 25),
      reloadTime: 1500 + Math.random() * 1500,
    };
  } catch (error) {
    console.log("Weapon generation failed, using fallback:", error);
    return {
      damage: 25 + Math.random() * 50,
      fireRate: 2 + Math.random() * 8,
      recoil: 0.1 + Math.random() * 0.5,
      spread: 0.02 + Math.random() * 0.15,
      magazineSize: Math.floor(10 + Math.random() * 25),
      reloadTime: 1500 + Math.random() * 1500,
    };
  }
}
