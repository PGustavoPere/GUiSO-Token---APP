/**
 * Configuración económica del ecosistema GUISO.
 * Define la paridad y las reglas de conversión.
 */

// Paridad: 1 GSO = 100 ARS (Pesos Argentinos)
// Esta tasa es fija para el MVP para dar estabilidad a los comercios.
export const GUISO_RATE_ARS = 100;

// Símbolos y formatos
export const FIAT_SYMBOL = 'ARS';
export const TOKEN_SYMBOL = 'GSO';

/**
 * Convierte una cantidad de tokens GSO a su valor en Fiat (ARS).
 */
export const convertGuisoToFiat = (guisoAmount: number): number => {
  return guisoAmount * GUISO_RATE_ARS;
};

/**
 * Convierte una cantidad de Fiat (ARS) a tokens GSO.
 */
export const convertFiatToGuiso = (fiatAmount: number): number => {
  return Math.ceil(fiatAmount / GUISO_RATE_ARS);
};
