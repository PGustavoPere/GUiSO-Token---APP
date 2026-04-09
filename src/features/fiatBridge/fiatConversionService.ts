import { GUISO_RATE_ARS } from '../../core/economy';

export const FIAT_CONVERSION_RATE = GUISO_RATE_ARS;

export const fiatConversionService = {
  convertFiatToGuiso: (arsAmount: number): number => {
    return arsAmount / FIAT_CONVERSION_RATE;
  },
  convertGuisoToFiat: (guisoAmount: number): number => {
    return guisoAmount * FIAT_CONVERSION_RATE;
  }
};
