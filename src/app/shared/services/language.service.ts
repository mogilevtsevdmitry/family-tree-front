import { Injectable, signal } from '@angular/core';

export type UiLang = string; // 'ru' | 'en' | 'de' | ...

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly root = document.documentElement;

  /** актуальный язык приложения (signal) */
  readonly current = signal<UiLang>('ru');

  init(autoDetect = true, fallback: UiLang = 'ru'): void {
    if (autoDetect) {
      const fromTg = this.detectTelegramLang();
      const fromNavigator = navigator.language?.split('-')[0];
      const lang = fromTg || fromNavigator || fallback;
      this.setLang(lang);
    } else {
      this.setLang(fallback);
    }
  }

  setLang(lang: UiLang): void {
    this.current.set(lang);
    this.root.setAttribute('lang', lang);
    const rtlList = ['ar', 'he', 'fa', 'ur'];
    this.root.setAttribute('dir', rtlList.includes(lang) ? 'rtl' : 'ltr');
    // можно при желании кидать кастомное событие
  }

  getLang(): UiLang {
    return this.current();
  }

  private detectTelegramLang(): UiLang | null {
    const w = window as any;
    const tg = w?.Telegram?.WebApp;
    const code: string | undefined = tg?.initDataUnsafe?.user?.language_code ?? tg?.platform;
    if (!code) return null;
    return String(code).toLowerCase().split('-')[0];
  }
}
