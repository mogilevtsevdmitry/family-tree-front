/**
 * LanguageService — отдельный от темы. Управляет языком и направлением письма.
 * По умолчанию — берём из Telegram WebApp, если присутствует, иначе — из браузера.
 */
import { Injectable } from '@angular/core';

export type UiLang = string; // 'ru' | 'en' | 'de' | ...

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly root = document.documentElement;

  /** Инициализация языка. Можно вызвать в App initializer. */
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

  /** Явная установка языка (и направления письма) */
  setLang(lang: UiLang): void {
    this.root.setAttribute('lang', lang);
    const rtlList = ['ar', 'he', 'fa', 'ur'];
    this.root.setAttribute('dir', rtlList.includes(lang) ? 'rtl' : 'ltr');
  }

  getLang(): UiLang {
    return this.root.getAttribute('lang') || 'ru';
  }

  /** Попытка достать язык пользователя из Telegram WebApp */
  private detectTelegramLang(): UiLang | null {
    // безопасная проверка наличия объекта
    const w = window as any;
    const tg = w?.Telegram?.WebApp;
    const code: string | undefined = tg?.initDataUnsafe?.user?.language_code ?? tg?.platform; // platform — запасной вариант
    if (!code) return null;
    // Нормализуем: "ru-RU" -> "ru"
    return String(code).toLowerCase().split('-')[0];
  }
}
