import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate-mission", async (req, res) => {
    try {
      const { playerLevel, coordinates } = req.body;

      if (!openai) {
        return res.json({
          mission: generateFallbackMission(playerLevel || 1, coordinates),
        });
      }

      const systemPrompt = `You are the Game Master of a gritty open-world tactical shooter RPG. Based on the player's level and location, generate a unique mission objective. You must respond in valid JSON format only.`;

      const userPrompt = `Generate a mission for a level ${playerLevel || 1} player at coordinates (${coordinates?.x || 0}, ${coordinates?.y || 0}). 

The mission should be challenging but fair for the player's level. Create an objective under 50 words.

Respond with JSON in exactly this format:
{
  "id": "unique_mission_id",
  "title": "Mission Title (3-5 words)",
  "objective": "Brief mission description under 50 words",
  "reward": number between 300-2000 based on difficulty,
  "targetNPC": "Name of the target enemy or objective"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 256,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const mission = JSON.parse(content);
      res.json({ mission });
    } catch (error) {
      console.error("Mission generation error:", error);
      const { playerLevel, coordinates } = req.body;
      res.json({
        mission: generateFallbackMission(playerLevel || 1, coordinates),
      });
    }
  });

  app.post("/api/generate-weapon", async (req, res) => {
    try {
      if (!openai) {
        return res.json({ stats: generateFallbackWeaponStats() });
      }

      const systemPrompt = `You are a weapon designer for a tactical shooter game. Generate balanced weapon statistics. Respond in valid JSON format only.`;

      const userPrompt = `Create unique weapon stats for a procedurally generated weapon. The weapon should be balanced but interesting.

Respond with JSON in exactly this format:
{
  "damage": number between 20-100,
  "fireRate": number between 1-12 (shots per second),
  "recoil": number between 0.1-0.9,
  "spread": number between 0.02-0.3,
  "magazineSize": integer between 5-50,
  "reloadTime": number between 1000-3500 (milliseconds)
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 128,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const stats = JSON.parse(content);
      res.json({ stats });
    } catch (error) {
      console.error("Weapon generation error:", error);
      res.json({ stats: generateFallbackWeaponStats() });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateFallbackMission(
  playerLevel: number,
  coordinates?: { x: number; y: number }
) {
  const missions = [
    {
      title: "Sector Sweep",
      objective:
        "Clear all hostile forces from the designated sector and establish a safe perimeter.",
      targetNPC: "Enemy Commander",
      baseReward: 500,
    },
    {
      title: "Intel Recovery",
      objective:
        "Locate and retrieve the encrypted data drive from the abandoned outpost.",
      targetNPC: "Intel Officer",
      baseReward: 750,
    },
    {
      title: "High Value Target",
      objective:
        "Track and eliminate the enemy lieutenant before they escape the combat zone.",
      targetNPC: "Lieutenant Voss",
      baseReward: 1000,
    },
    {
      title: "Supply Line Disruption",
      objective:
        "Intercept and destroy the enemy supply convoy approaching from the north.",
      targetNPC: "Convoy Leader",
      baseReward: 600,
    },
    {
      title: "Rescue Operation",
      objective:
        "Extract the captured operative from the enemy stronghold before dawn.",
      targetNPC: "Prison Warden",
      baseReward: 850,
    },
  ];

  const mission = missions[Math.floor(Math.random() * missions.length)];
  const levelMultiplier = 1 + (playerLevel - 1) * 0.2;

  return {
    id: `mission_${Date.now()}`,
    title: mission.title,
    objective: mission.objective,
    reward: Math.round(mission.baseReward * levelMultiplier),
    targetNPC: mission.targetNPC,
  };
}

function generateFallbackWeaponStats() {
  return {
    damage: 25 + Math.random() * 50,
    fireRate: 2 + Math.random() * 8,
    recoil: 0.1 + Math.random() * 0.5,
    spread: 0.02 + Math.random() * 0.15,
    magazineSize: Math.floor(10 + Math.random() * 25),
    reloadTime: 1500 + Math.random() * 1500,
  };
}
