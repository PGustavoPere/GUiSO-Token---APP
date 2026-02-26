import { useCallback } from 'react';
import { es } from './es';
import { TranslationSchema } from './types';

export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let current: any = es;

  for (const k of keys) {
    if (current[k] === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    current = current[k];
  }

  if (typeof current !== 'string') {
    console.warn(`Translation key does not resolve to a string: ${key}`);
    return key;
  }

  let result = current;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    }
  }

  return result;
};

export function useTranslation() {
  const tHook = useCallback((key: string, params?: Record<string, string | number>): string => {
    return t(key, params);
  }, []);

  return { t: tHook };
}
