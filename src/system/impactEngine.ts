/**
 * Impact Engine - GUISO SocialFi System
 * Handles level calculations, impact logic, and motivational feedback.
 */

export enum CommunityLevel {
  LEVEL_1 = "Aspirante",
  LEVEL_2 = "Agente GUISO",
  LEVEL_3 = "Guardián",
  LEVEL_4 = "Embajador",
  LEVEL_5 = "Leyenda",
}

export interface LevelThreshold {
  level: CommunityLevel;
  minPoints: number;
  message: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: CommunityLevel.LEVEL_1, minPoints: 0, message: "¡Bienvenido al ecosistema de impacto!" },
  { level: CommunityLevel.LEVEL_2, minPoints: 500, message: "Tu impacto está creciendo. ¡Ya eres un Agente GUISO!" },
  { level: CommunityLevel.LEVEL_3, minPoints: 2000, message: "Eres un pilar fundamental para GUISO. Guardián del ecosistema." },
  { level: CommunityLevel.LEVEL_4, minPoints: 5000, message: "Embajador del impacto. Tu voz lidera la comunidad." },
  { level: CommunityLevel.LEVEL_5, minPoints: 10000, message: "Leyenda viviente. Tu impacto es histórico y transformador." },
];

export const MOTIVATIONAL_MESSAGES = [
  "¡Cada acción de impacto cuenta!",
  "Tu participación fortalece el ecosistema.",
  "Gracias por ser parte del impacto real.",
  "Impacto verificado y registrado.",
  "El ecosistema GUISO crece gracias a ti.",
];

export const impactEngine = {
  /**
   * Calculates the current level based on impact points.
   */
  calculateLevel(points: number): LevelThreshold {
    const reversedThresholds = [...LEVEL_THRESHOLDS].reverse();
    return reversedThresholds.find(t => points >= t.minPoints) || LEVEL_THRESHOLDS[0];
  },

  /**
   * Gets the next level threshold.
   */
  getNextThreshold(points: number): LevelThreshold | null {
    return LEVEL_THRESHOLDS.find(t => t.minPoints > points) || null;
  },

  /**
   * Returns a random motivational message.
   */
  getRandomMotivation(): string {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
  },

  /**
   * Calculates impact points from a GSO amount (10%).
   */
  calculateImpactPoints(amount: number): number {
    return Math.floor(amount * 0.1);
  },

  /**
   * Calculates symbolic meals from a GSO amount (50 GSO = 1 meal).
   */
  calculateMeals(amount: number): number {
    return Math.floor(amount / 50);
  }
};
