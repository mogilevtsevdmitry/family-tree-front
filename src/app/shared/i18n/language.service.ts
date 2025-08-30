// src/app/shared/i18n/language.service.ts
import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, shareReplay } from 'rxjs/operators';
import {
  DEFAULT_LANG,
  I18N_DEFAULT_LANG,
  I18N_STORAGE_KEY,
  I18N_SUPPORTED_LANGS,
  RTL_LANGS,
  SupportedLang,
} from './i18n.tokens';
import { normalizeLang, isSupported } from './i18n.util';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly doc = inject(DOCUMENT);
  private readonly supported = inject(I18N_SUPPORTED_LANGS);
  private readonly fallback = inject(I18N_DEFAULT_LANG) as SupportedLang;

  /** Текущее значение языка (signal) */
  private readonly _current: WritableSignal<SupportedLang> = signal(
    (normalizeLang(this.translate.getCurrentLang?.()) as SupportedLang) || this.fallback
  );

  /** Публичный signal */
  readonly current: Signal<SupportedLang> = this._current.asReadonly();

  /** Rx поток смены языка */
  readonly current$ = this.translate.onLangChange.pipe(
    map((e) => (normalizeLang(e.lang) as SupportedLang) || this.fallback),
    filter((l) => this.supported.includes(l)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Инициализация: localStorage → Telegram → browser → fallback */
  init(): void {
    const stored = normalizeLang(localStorage.getItem(I18N_STORAGE_KEY));
    const tg = normalizeLang(
      window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ??
        window?.Telegram?.WebApp?.languageCode
    );
    const browser = normalizeLang(navigator?.language);

    const candidates = [stored, tg, browser, this.fallback].filter(Boolean) as string[];
    const chosen =
      (candidates.find((c) => this.supported.includes(c)) as SupportedLang) ?? this.fallback;

    this.translate.addLangs(this.supported as string[]);
    this.translate.setFallbackLang(this.fallback);

    this.use(chosen);
  }

  /** Принудительная установка языка (с валидацией) */
  use(lang: string): void {
    const normalized = normalizeLang(lang);
    const safe =
      normalized && this.supported.includes(normalized)
        ? (normalized as SupportedLang)
        : this.fallback;

    // если уже активен — просто синхронизируем html-атрибуты и сигнал
    const current = normalizeLang(this.translate.getCurrentLang?.());
    if (current === safe) {
      this.applyHtmlAttributes(safe);
      this._current.set(safe);
      return;
    }

    this.translate.use(safe).subscribe({
      next: () => {
        this._current.set(safe);
        this.applyHtmlAttributes(safe);
        try {
          localStorage.setItem(I18N_STORAGE_KEY, safe);
        } catch {}
      },
      error: () => {
        if (safe !== this.fallback) {
          this.translate.use(this.fallback).subscribe(() => {
            this._current.set(this.fallback);
            this.applyHtmlAttributes(this.fallback);
            try {
              localStorage.setItem(I18N_STORAGE_KEY, this.fallback);
            } catch {}
          });
        }
      },
    });
  }

  /** Применить язык из Telegram WebApp (если валиден) */
  useFromTelegram(): void {
    const tg = normalizeLang(
      window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ??
        window?.Telegram?.WebApp?.languageCode
    );
    if (tg && isSupported(tg)) this.use(tg);
  }

  /** Циклическое переключение (например, для кнопки) */
  cycle(): void {
    const list = this.supported as SupportedLang[];
    const idx = list.indexOf(this.current());
    const next = list[(idx + 1) % list.length];
    this.use(next);
  }

  // ======== internals ========

  private applyHtmlAttributes(lang: SupportedLang): void {
    const html = this.doc?.documentElement;
    if (!html) return;
    html.setAttribute('lang', lang);
    const dir = (RTL_LANGS as readonly string[]).includes(lang) ? 'rtl' : 'ltr';
    html.setAttribute('dir', dir);
  }
}
