export type NPCState = "idle" | "patrol" | "aggressive";

export interface NPCPosition {
  x: number;
  y: number;
}

export interface NPC {
  id: string;
  name: string;
  state: NPCState;
  position: NPCPosition;
  health: number;
  maxHealth: number;
  detectionRange: number;
  attackRange: number;
  speed: number;
  patrolPoints?: NPCPosition[];
  currentPatrolIndex?: number;
}

export interface NPCConfig {
  name: string;
  health?: number;
  detectionRange?: number;
  attackRange?: number;
  speed?: number;
  patrolPoints?: NPCPosition[];
}

const DEFAULT_NPC_CONFIG = {
  health: 100,
  detectionRange: 150,
  attackRange: 50,
  speed: 2,
};

export class NPCController {
  private npc: NPC;
  private stateTransitionTime: number = 0;
  private lastUpdateTime: number = 0;

  constructor(id: string, position: NPCPosition, config: NPCConfig) {
    this.npc = {
      id,
      name: config.name,
      state: config.patrolPoints ? "patrol" : "idle",
      position: { ...position },
      health: config.health ?? DEFAULT_NPC_CONFIG.health,
      maxHealth: config.health ?? DEFAULT_NPC_CONFIG.health,
      detectionRange: config.detectionRange ?? DEFAULT_NPC_CONFIG.detectionRange,
      attackRange: config.attackRange ?? DEFAULT_NPC_CONFIG.attackRange,
      speed: config.speed ?? DEFAULT_NPC_CONFIG.speed,
      patrolPoints: config.patrolPoints,
      currentPatrolIndex: 0,
    };
    this.lastUpdateTime = Date.now();
  }

  update(playerPosition: NPCPosition): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    const distanceToPlayer = this.getDistanceTo(playerPosition);

    switch (this.npc.state) {
      case "idle":
        this.handleIdleState(distanceToPlayer);
        break;
      case "patrol":
        this.handlePatrolState(distanceToPlayer, deltaTime);
        break;
      case "aggressive":
        this.handleAggressiveState(playerPosition, distanceToPlayer, deltaTime);
        break;
    }
  }

  private handleIdleState(distanceToPlayer: number): void {
    if (distanceToPlayer <= this.npc.detectionRange) {
      this.transitionTo("aggressive");
    }
  }

  private handlePatrolState(distanceToPlayer: number, deltaTime: number): void {
    if (distanceToPlayer <= this.npc.detectionRange) {
      this.transitionTo("aggressive");
      return;
    }

    if (this.npc.patrolPoints && this.npc.patrolPoints.length > 0) {
      const targetPoint = this.npc.patrolPoints[this.npc.currentPatrolIndex!];
      const distanceToTarget = this.getDistanceTo(targetPoint);

      if (distanceToTarget < 5) {
        this.npc.currentPatrolIndex =
          (this.npc.currentPatrolIndex! + 1) % this.npc.patrolPoints.length;
      } else {
        this.moveTowards(targetPoint, deltaTime);
      }
    }
  }

  private handleAggressiveState(
    playerPosition: NPCPosition,
    distanceToPlayer: number,
    deltaTime: number
  ): void {
    if (distanceToPlayer > this.npc.detectionRange * 1.5) {
      this.transitionTo(this.npc.patrolPoints ? "patrol" : "idle");
      return;
    }

    if (distanceToPlayer > this.npc.attackRange) {
      this.moveTowards(playerPosition, deltaTime);
    }
  }

  private moveTowards(target: NPCPosition, deltaTime: number): void {
    const dx = target.x - this.npc.position.x;
    const dy = target.y - this.npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveDistance = this.npc.speed * deltaTime * 60;
      const ratio = Math.min(moveDistance / distance, 1);
      this.npc.position.x += dx * ratio;
      this.npc.position.y += dy * ratio;
    }
  }

  private getDistanceTo(target: NPCPosition): number {
    const dx = target.x - this.npc.position.x;
    const dy = target.y - this.npc.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private transitionTo(newState: NPCState): void {
    if (this.npc.state !== newState) {
      this.npc.state = newState;
      this.stateTransitionTime = Date.now();
    }
  }

  takeDamage(amount: number): boolean {
    this.npc.health = Math.max(0, this.npc.health - amount);
    if (this.npc.state !== "aggressive") {
      this.transitionTo("aggressive");
    }
    return this.npc.health <= 0;
  }

  heal(amount: number): void {
    this.npc.health = Math.min(this.npc.maxHealth, this.npc.health + amount);
  }

  getState(): NPCState {
    return this.npc.state;
  }

  getPosition(): NPCPosition {
    return { ...this.npc.position };
  }

  getHealth(): number {
    return this.npc.health;
  }

  getMaxHealth(): number {
    return this.npc.maxHealth;
  }

  getNPC(): NPC {
    return { ...this.npc };
  }

  isInAttackRange(playerPosition: NPCPosition): boolean {
    return this.getDistanceTo(playerPosition) <= this.npc.attackRange;
  }

  canAttack(): boolean {
    return this.npc.state === "aggressive" && this.npc.health > 0;
  }
}

export class NPCManager {
  private npcs: Map<string, NPCController> = new Map();

  spawnNPC(id: string, position: NPCPosition, config: NPCConfig): NPCController {
    const controller = new NPCController(id, position, config);
    this.npcs.set(id, controller);
    return controller;
  }

  removeNPC(id: string): boolean {
    return this.npcs.delete(id);
  }

  updateAll(playerPosition: NPCPosition): void {
    this.npcs.forEach((npc) => npc.update(playerPosition));
  }

  getNPC(id: string): NPCController | undefined {
    return this.npcs.get(id);
  }

  getAllNPCs(): NPC[] {
    return Array.from(this.npcs.values()).map((controller) => controller.getNPC());
  }

  getActiveNPCs(): NPC[] {
    return this.getAllNPCs().filter((npc) => npc.health > 0);
  }

  getAggressiveNPCs(): NPC[] {
    return this.getAllNPCs().filter(
      (npc) => npc.state === "aggressive" && npc.health > 0
    );
  }

  getNPCsInRange(position: NPCPosition, range: number): NPC[] {
    return this.getAllNPCs().filter((npc) => {
      const dx = npc.position.x - position.x;
      const dy = npc.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }
}

export function createEnemySquad(manager: NPCManager, centerPosition: NPCPosition): void {
  const squadSize = 3;
  const spread = 50;

  for (let i = 0; i < squadSize; i++) {
    const angle = (i / squadSize) * Math.PI * 2;
    const position: NPCPosition = {
      x: centerPosition.x + Math.cos(angle) * spread,
      y: centerPosition.y + Math.sin(angle) * spread,
    };

    manager.spawnNPC(`enemy_${Date.now()}_${i}`, position, {
      name: `Hostile ${i + 1}`,
      health: 50 + Math.random() * 50,
      speed: 1.5 + Math.random(),
    });
  }
}

export function createPatrollingGuard(
  manager: NPCManager,
  id: string,
  patrolPoints: NPCPosition[]
): NPCController {
  return manager.spawnNPC(id, patrolPoints[0], {
    name: "Guard",
    health: 100,
    detectionRange: 200,
    speed: 1.5,
    patrolPoints,
  });
}
