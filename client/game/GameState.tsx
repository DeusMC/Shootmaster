import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface Mission {
  id: string;
  title: string;
  objective: string;
  reward: number;
  targetNPC: string;
}

export interface GameState {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  playerLevel: number;
  position: { x: number; y: number };
  currentMission: Mission | null;
  equippedWeapon: string;
  score: number;
}

type GameAction =
  | { type: "SHOOT" }
  | { type: "RELOAD" }
  | { type: "TAKE_DAMAGE"; payload: number }
  | { type: "HEAL"; payload: number }
  | { type: "MOVE"; payload: { x: number; y: number } }
  | { type: "SET_MISSION"; payload: Mission }
  | { type: "COMPLETE_MISSION" }
  | { type: "EQUIP_WEAPON"; payload: string }
  | { type: "ADD_SCORE"; payload: number }
  | { type: "RESET" };

const initialState: GameState = {
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  playerLevel: 1,
  position: { x: 0, y: 0 },
  currentMission: null,
  equippedWeapon: "rifle",
  score: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SHOOT":
      if (state.ammo <= 0) return state;
      return { ...state, ammo: state.ammo - 1 };

    case "RELOAD":
      return { ...state, ammo: state.maxAmmo };

    case "TAKE_DAMAGE":
      const newHealth = Math.max(0, state.health - action.payload);
      return { ...state, health: newHealth };

    case "HEAL":
      const healedHealth = Math.min(state.maxHealth, state.health + action.payload);
      return { ...state, health: healedHealth };

    case "MOVE":
      return {
        ...state,
        position: {
          x: state.position.x + action.payload.x,
          y: state.position.y + action.payload.y,
        },
      };

    case "SET_MISSION":
      return { ...state, currentMission: action.payload };

    case "COMPLETE_MISSION":
      if (!state.currentMission) return state;
      return {
        ...state,
        score: state.score + state.currentMission.reward,
        currentMission: null,
      };

    case "EQUIP_WEAPON":
      return { ...state, equippedWeapon: action.payload };

    case "ADD_SCORE":
      return { ...state, score: state.score + action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}
