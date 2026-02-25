export const FIAT_CONVERSION_RATE = 100; // 1 GUISO = 100 ARS

export const fiatConversionService = {
  convertFiatToGuiso: (arsAmount: number): number => {
    return arsAmount / FIAT_CONVERSION_RATE;
  },
  convertGuisoToFiat: (guisoAmount: number): number => {
    return guisoAmount * FIAT_CONVERSION_RATE;
  }
};
