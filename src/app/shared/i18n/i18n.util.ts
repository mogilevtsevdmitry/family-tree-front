import { I18N_SUPPORTED_LANGS } from './i18n.tokens';
import { inject } from '@angular/core';

export function normalizeLang(code?: string | null): string | null {
  if (!code) return null;
  const base = code.toLowerCase().trim();
  const short = base.includes('-') ? base.split('-')[0] : base;
  return short || null;
}

export function isSupported(code?: string | null): boolean {
  if (!code) return false;
  const supported = inject(I18N_SUPPORTED_LANGS);
  return supported.includes(code);
}
