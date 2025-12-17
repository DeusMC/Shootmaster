export interface GunStats {
  damage: number;
  fireRate: number;
  recoil: number;
  spread: number;
  magazineSize: number;
  reloadTime: number;
}

export interface GunConfig {
  name: string;
  type: "pistol" | "rifle" | "shotgun" | "sniper";
  stats: GunStats;
}

const PRESET_GUNS: Record<string, GunConfig> = {
  pistol: {
    name: "M9 Pistol",
    type: "pistol",
    stats: {
      damage: 25,
      fireRate: 3,
      recoil: 0.2,
      spread: 0.05,
      magazineSize: 15,
      reloadTime: 1500,
    },
  },
  rifle: {
    name: "M4A1 Rifle",
    type: "rifle",
    stats: {
      damage: 35,
      fireRate: 8,
      recoil: 0.4,
      spread: 0.08,
      magazineSize: 30,
      reloadTime: 2000,
    },
  },
  shotgun: {
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
  },
  sniper: {
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
  },
};

export class GunController {
  private config: GunConfig;
  private currentAmmo: number;
  private isReloading: boolean = false;
  private lastFireTime: number = 0;
  private onFire?: () => void;
  private onReload?: () => void;
  private onEmpty?: () => void;

  constructor(config: GunConfig) {
    this.config = config;
    this.currentAmmo = config.stats.magazineSize;
  }

  setCallbacks(callbacks: {
    onFire?: () => void;
    onReload?: () => void;
    onEmpty?: () => void;
  }) {
    this.onFire = callbacks.onFire;
    this.onReload = callbacks.onReload;
    this.onEmpty = callbacks.onEmpty;
  }

  fire(): boolean {
    const now = Date.now();
    const fireInterval = 1000 / this.config.stats.fireRate;

    if (this.isReloading) {
      return false;
    }

    if (now - this.lastFireTime < fireInterval) {
      return false;
    }

    if (this.currentAmmo <= 0) {
      this.onEmpty?.();
      return false;
    }

    this.currentAmmo--;
    this.lastFireTime = now;
    this.onFire?.();

    return true;
  }

  reload(): Promise<void> {
    if (this.isReloading) {
      return Promise.resolve();
    }

    this.isReloading = true;
    this.onReload?.();

    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentAmmo = this.config.stats.magazineSize;
        this.isReloading = false;
        resolve();
      }, this.config.stats.reloadTime);
    });
  }

  getAmmo(): number {
    return this.currentAmmo;
  }

  getMagazineSize(): number {
    return this.config.stats.magazineSize;
  }

  getStats(): GunStats {
    return { ...this.config.stats };
  }

  getConfig(): GunConfig {
    return { ...this.config };
  }

  calculateDamage(): number {
    const baseDamage = this.config.stats.damage;
    const spreadFactor = 1 - Math.random() * this.config.stats.spread;
    return Math.round(baseDamage * spreadFactor);
  }

  getRecoilOffset(): { x: number; y: number } {
    const recoil = this.config.stats.recoil;
    return {
      x: (Math.random() - 0.5) * recoil * 10,
      y: -Math.random() * recoil * 15,
    };
  }
}

export class GunFactory {
  static createPreset(type: keyof typeof PRESET_GUNS): GunController {
    const config = PRESET_GUNS[type];
    if (!config) {
      throw new Error(`Unknown preset gun type: ${type}`);
    }
    return new GunController(config);
  }

  static createFromJSON(jsonConfig: GunConfig): GunController {
    const validatedConfig = this.validateConfig(jsonConfig);
    return new GunController(validatedConfig);
  }

  static createAIGenerated(aiStats: Partial<GunStats>, name: string, type: GunConfig["type"]): GunController {
    const defaultStats: GunStats = {
      damage: 30,
      fireRate: 5,
      recoil: 0.3,
      spread: 0.1,
      magazineSize: 20,
      reloadTime: 2000,
    };

    const config: GunConfig = {
      name,
      type,
      stats: {
        ...defaultStats,
        ...aiStats,
      },
    };

    return new GunController(this.validateConfig(config));
  }

  private static validateConfig(config: GunConfig): GunConfig {
    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    return {
      name: config.name || "Unknown Weapon",
      type: config.type || "rifle",
      stats: {
        damage: clamp(config.stats.damage, 1, 200),
        fireRate: clamp(config.stats.fireRate, 0.1, 20),
        recoil: clamp(config.stats.recoil, 0, 1),
        spread: clamp(config.stats.spread, 0, 1),
        magazineSize: clamp(Math.floor(config.stats.magazineSize), 1, 100),
        reloadTime: clamp(config.stats.reloadTime, 500, 5000),
      },
    };
  }

  static getPresetList(): string[] {
    return Object.keys(PRESET_GUNS);
  }

  static getPresetConfig(type: string): GunConfig | undefined {
    return PRESET_GUNS[type];
  }
}
