import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, UiLang } from '../../../services/language.service';

const LANG_STORAGE_KEY = 'app.lang';
type LangItem = { code: UiLang; label: string; emoji?: string };

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: inline-block;
        position: relative;
      }

      .lg-select {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.9rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        color: var(--fg);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
        cursor: pointer;
        user-select: none;
        font-weight: 600;
        min-width: 8.5rem;
      }
      .lg-select:focus-visible {
        outline: 2px solid rgba(var(--lg-tint), 0.8);
        outline-offset: 2px;
      }
      .lg-select .emoji {
        font-size: 1rem;
        line-height: 1;
      }
      .lg-select .caret {
        margin-left: 0.25rem;
        transition: transform 0.15s ease;
      }
      .lg-select[aria-expanded='true'] .caret {
        transform: rotate(180deg);
      }

      .lg-dropdown {
        position: absolute;
        z-index: 1200;
        top: 100%;
        left: 0;
        margin-top: 0.4rem;
        min-width: 100%;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.28), inset 0 1px rgba(255, 255, 255, 0.35);
        overflow: hidden;
        animation: lg-pop 0.12s ease-out;
        display: none;
      }
      .lg-dropdown.is-open {
        display: block;
      }
      @keyframes lg-pop {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .lg-list {
        max-height: 260px;
        overflow: auto;
        outline: none;
      }
      .lg-list::-webkit-scrollbar {
        width: 10px;
      }
      .lg-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.28);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .lg-option {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.55rem 0.85rem;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 0.12s ease, transform 0.06s ease;
        outline: none;
      }
      .lg-option .emoji {
        font-size: 1rem;
        line-height: 1;
      }
      .lg-option[aria-selected='true'] {
        background: rgba(var(--lg-tint), 0.14);
      }
      .lg-option.is-active {
        background: rgba(255, 255, 255, 0.12);
      }
      .lg-option:active {
        transform: translateY(1px);
      }

      @media (prefers-reduced-motion: reduce) {
        .lg-dropdown {
          animation: none;
        }
      }
    `,
  ],
  template: `
    <button
      type="button"
      class="lg-select"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="emoji" aria-hidden="true">{{ current().emoji }}</span>
      <span>{{ current().label }}</span>
      <span class="caret" aria-hidden="true">▾</span>
    </button>

    <div
      class="lg-dropdown"
      role="listbox"
      [class.is-open]="open()"
      [hidden]="!open()"
      [attr.aria-activedescendant]="'opt-' + activeIndex()"
      (keydown)="onListKeydown($event)"
      tabindex="0"
    >
      <div class="lg-list">
        <div
          *ngFor="let item of items; let i = index"
          class="lg-option"
          role="option"
          [id]="'opt-' + i"
          [attr.aria-selected]="item.code === lang()"
          [class.is-active]="i === activeIndex()"
          [attr.tabindex]="i === activeIndex() ? 0 : -1"
          (click)="choose(item)"
          (mousemove)="setActive(i)"
          (keydown)="onOptionKeydown($event, i)"
        >
          <span class="emoji" aria-hidden="true">{{ item.emoji }}</span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  `,
})
export class LanguageToggleComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly i18n = inject(LanguageService);

  readonly items: LangItem[] = [
    { code: 'ru', label: 'Русский', emoji: '🇷🇺' },
    { code: 'en', label: 'English', emoji: '🇬🇧' },
    { code: 'de', label: 'Deutsch', emoji: '🇩🇪' },
  ];

  readonly lang = signal<UiLang>(this.readInitialLang());
  readonly open = signal(false);
  readonly activeIndex = signal(this.indexOf(this.lang()));
  readonly current = computed(() => this.items[this.indexOf(this.lang())] ?? this.items[0]);

  constructor() {
    effect(() => {
      const l = this.lang();
      this.i18n.setLang(l);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, l);
      } catch {}
    });
  }

  toggle() {
    this.open() ? this.closeList() : this.openList();
  }

  openList() {
    if (this.open()) return;
    this.open.set(true);
    this.activeIndex.set(this.indexOf(this.lang()));
    queueMicrotask(() => this.focusList());
  }

  closeList() {
    this.open.set(false);
  }

  choose(item: LangItem) {
    this.lang.set(item.code);
    this.closeList();
    this.focusTrigger();
  }

  setActive(i: number) {
    if (i < 0 || i >= this.items.length) return;
    this.activeIndex.set(i);
    this.focusActiveOption();
  }

  onTriggerKeydown(e: KeyboardEvent) {
    if (!this.open()) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openList();
        return;
      }
    } else {
      const max = this.items.length - 1;
      let idx = this.activeIndex();
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          idx = Math.min(max, idx + 1);
          this.setActive(idx);
          break;
        case 'ArrowUp':
          e.preventDefault();
          idx = Math.max(0, idx - 1);
          this.setActive(idx);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.choose(this.items[this.activeIndex()]);
          break;
        case 'Escape':
          e.preventDefault();
          this.closeList();
          break;
      }
    }
  }

  onListKeydown(e: KeyboardEvent) {
    const max = this.items.length - 1;
    let idx = this.activeIndex();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        idx = Math.min(max, idx + 1);
        this.setActive(idx);
        break;
      case 'ArrowUp':
        e.preventDefault();
        idx = Math.max(0, idx - 1);
        this.setActive(idx);
        break;
      case 'Home':
        e.preventDefault();
        this.setActive(0);
        break;
      case 'End':
        e.preventDefault();
        this.setActive(max);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.choose(this.items[this.activeIndex()]);
        break;
      case 'Escape':
        e.preventDefault();
        this.closeList();
        this.focusTrigger();
        break;
      case 'Tab':
        this.closeList();
        break;
    }
  }

  onOptionKeydown(e: KeyboardEvent, i: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.choose(this.items[i]);
    }
  }

  private indexOf(code: UiLang) {
    const i = this.items.findIndex((x) => x.code === code);
    return i >= 0 ? i : 0;
  }

  private readInitialLang(): UiLang {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) return saved as UiLang;
    } catch {}
    return this.i18n.getLang() || 'ru';
  }

  private focusTrigger() {
    const btn = this.host.nativeElement.querySelector('.lg-select') as HTMLButtonElement | null;
    btn?.focus();
  }

  private focusList() {
    const list = this.host.nativeElement.querySelector('.lg-dropdown') as HTMLElement | null;
    list?.focus();
    this.focusActiveOption();
  }

  private focusActiveOption() {
    const id = 'opt-' + this.activeIndex();
    const el = this.host.nativeElement.querySelector('#' + id);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: 'nearest' });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.open()) return;
    const root = this.host.nativeElement;
    if (!root.contains(e.target as Node)) this.closeList();
  }

  @HostListener('document:keydown.escape')
  onDocEsc() {
    if (this.open()) {
      this.closeList();
      this.focusTrigger();
    }
  }
}
