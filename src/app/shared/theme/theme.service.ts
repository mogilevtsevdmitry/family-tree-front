import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_THEME_KEY = 'theme';
const STORAGE_LIQUID_KEY = 'liquid';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly _theme: WritableSignal<ThemeMode> = signal('light');
  private readonly _liquid: WritableSignal<boolean> = signal(true);

  get theme(): Signal<ThemeMode> {
    return this._theme.asReadonly();
  }
  get liquid(): Signal<boolean> {
    return this._liquid.asReadonly();
  }

  init(): void {
    const tgScheme = window?.Telegram?.WebApp?.colorScheme as ThemeMode | undefined;
    const prefersDark =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode | null;

    const mode: ThemeMode = savedTheme ?? tgScheme ?? (prefersDark ? 'dark' : 'light');
    const savedLiquid = localStorage.getItem(STORAGE_LIQUID_KEY);
    const liquid = savedLiquid === null ? true : savedLiquid === '1';

    this.setTheme(mode);
    this.setLiquid(liquid);
  }

  setTheme(mode: ThemeMode): void {
    this._theme.set(mode);
    this.doc.documentElement.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, mode);
    } catch {}
  }
  toggleTheme(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setLiquid(on: boolean): void {
    this._liquid.set(on);
    try {
      localStorage.setItem(STORAGE_LIQUID_KEY, on ? '1' : '0');
    } catch {}
  }
  toggleLiquid(): void {
    this.setLiquid(!this._liquid());
  }
}
