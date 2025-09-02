/**
 * ThemeService — отвечает только за тему и тонкую настройку Liquid Glass.
 * Никакого языка и ничего лишнего.
 */
import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

export type LiquidGlassVars = Partial<{
  blur: number | string;       // px или строка вида "10px"
  saturation: number;          // множитель
  opacity: number;             // 0..1
  border: number;              // 0..1
  highlight: number;           // 0..1
  shadow: number;              // 0..1
  radius: number | string;     // px или "16px"
  tint: string;                // "r, g, b" (например "255,153,0")
  noiseAlpha: number;          // 0..1
  shimmerSpeed: string;        // "18s" | "0s" etc.
}>;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = document.documentElement;

  /** Установить тему: 'light' | 'dark' */
  setTheme(mode: ThemeMode): void {
    this.root.setAttribute('data-theme', mode);
    this.root.style.setProperty('color-scheme', mode);
  }

  /** Прочитать текущую тему (если не выставлена — определяем по DOM) */
  getTheme(): ThemeMode {
    return (this.root.getAttribute('data-theme') as ThemeMode) ?? 'dark';
  }

  /** Точечная настройка токенов Liquid Glass */
  setLiquidGlass(vars: LiquidGlassVars): void {
    const map: Record<string, string> = {
      blur: '--lg-blur',
      saturation: '--lg-saturation',
      opacity: '--lg-opacity',
      border: '--lg-border',
      highlight: '--lg-highlight',
      shadow: '--lg-shadow',
      radius: '--lg-radius',
      tint: '--lg-tint',
      noiseAlpha: '--lg-noise-alpha',
      shimmerSpeed: '--lg-shimmer-speed',
    };
    Object.entries(vars).forEach(([k, v]) => {
      const cssVar = map[k];
      if (!cssVar) return;
      const val =
        typeof v === 'number' && (k === 'blur' || k === 'radius')
          ? `${v}px`
          : String(v);
      this.root.style.setProperty(cssVar, val);
    });
  }

  /** Сбросить пользовательские оверрайды токенов */
  resetLiquidGlass(): void {
    const props = [
      '--lg-blur', '--lg-saturation', '--lg-opacity', '--lg-border',
      '--lg-highlight', '--lg-shadow', '--lg-radius', '--lg-tint',
      '--lg-noise-alpha', '--lg-shimmer-speed'
    ];
    props.forEach(p => this.root.style.removeProperty(p));
  }
}
