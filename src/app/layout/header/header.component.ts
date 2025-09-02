import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../../shared/components/theme-toggle/language-toggle/language-toggle.component';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent, LanguageToggleComponent],
  styles: [
    `
      :host {
        display: block;
      }

      header {
        position: sticky;
        top: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0.75rem 1rem;
      }

      .brand {
        font-weight: 800;
        letter-spacing: 0.3px;
        user-select: none;
      }
      .brand a {
        color: inherit;
        text-decoration: none;
      }

      /* базово показываем desktop-навигацию */
      nav.primary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-lg {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        color: var(--fg);
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
      }
      .btn-lg:active {
        transform: translateY(1px) scale(0.98);
      }

      /* burger (по умолчанию скрыт, покажем на мобиле) */
      .burger {
        display: none;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
        display: grid;
        place-items: center;
        cursor: pointer;
      }
      .burger span {
        display: block;
        width: 20px;
        height: 2px;
        background: var(--fg);
        position: relative;
      }
      .burger span::before,
      .burger span::after {
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--fg);
      }
      .burger span::before {
        top: -6px;
      }
      .burger span::after {
        top: 6px;
      }

      /* overlay */
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 1200;
        background: rgba(0, 0, 0, 0.35);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
      }
      .overlay.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      /* drawer */
      .drawer {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 100%;
        max-width: 300px;
        box-sizing: border-box;
        z-index: 1201;
        padding: 16px;
        transform: translateX(100%);
        transition: transform 0.2s ease;
        border-left: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.35), inset 0 1px rgba(255, 255, 255, 0.3);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .drawer.is-open {
        transform: translateX(0);
      }

      .drawer .row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }
      .drawer nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }
      .drawer .btn-lg {
        width: 100%;
        justify-content: center;
      }

      /* маленькая иконка-крестик */
      .icon-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
        cursor: pointer;
      }
      .icon-btn:focus-visible {
        outline: 2px solid rgba(var(--lg-tint), 0.8);
        outline-offset: 2px;
      }
      .icon-btn .x {
        position: relative;
        width: 16px;
        height: 16px;
      }
      .icon-btn .x::before,
      .icon-btn .x::after {
        content: '';
        position: absolute;
        top: 7px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--fg);
        transform-origin: center;
      }
      .icon-btn .x::before {
        transform: rotate(45deg);
      }
      .icon-btn .x::after {
        transform: rotate(-45deg);
      }

      /* адаптив: на мобильном скрываем desktop-навигацию и actions, показываем бургер */
      @media (max-width: 768px) {
        nav.primary {
          display: none;
        }
        .actions {
          display: none;
        }
        .burger {
          display: grid;
        }
      }
      @media (min-width: 769px) {
        nav.primary {
          display: flex;
        }
        .actions {
          display: flex;
        }
        .burger {
          display: none;
        }
      }
    `,
  ],
  template: `
    <header class="lg-container" role="banner" aria-label="Main header">
      <div class="brand">
        <a routerLink="/">{{ i18n.t('header.brand') }}</a>
      </div>

      <nav class="primary" aria-label="Primary">
        <a class="btn-lg" routerLink="/">{{ i18n.t('nav.home') }}</a>
        <a class="btn-lg" routerLink="/profile">{{ i18n.t('nav.profile') }}</a>
      </nav>

      <div class="actions">
        <app-language-toggle />
        <app-theme-toggle />
      </div>

      <button
        class="burger"
        type="button"
        aria-label="Menu"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <span></span>
      </button>
    </header>

    <div class="overlay" [class.is-open]="open()" (click)="close()"></div>

    <aside
      class="drawer lg-container"
      [class.is-open]="open()"
      role="dialog"
      aria-modal="true"
      [hidden]="!open()"
    >
      <div class="row">
        <button class="icon-btn" type="button" aria-label="Close menu" (click)="close()">
          <span class="x" aria-hidden="true"></span>
        </button>
      </div>

      <nav aria-label="Mobile">
        <a class="btn-lg" routerLink="/" (click)="close()">{{ i18n.t('nav.home') }}</a>
        <a class="btn-lg" routerLink="/profile" (click)="close()">{{ i18n.t('nav.profile') }}</a>
      </nav>

      <div class="row" style="justify-content: space-between;">
        <app-language-toggle />
        <app-theme-toggle />
      </div>
    </aside>
  `,
})
export class HeaderComponent {
  public i18n = inject(TranslationService);
  private readonly router = inject(Router);

  readonly open = signal(false);

  constructor() {
    // закрываем меню при навигации
    effect(() => {
      const opened = this.open();
      const sub = this.router.events.subscribe(() => {
        if (opened) this.close();
      });
      return () => {
        sub.unsubscribe();
        this.unlockScroll();
      };
    });
  }

  toggle() {
    this.open() ? this.close() : this.openMenu();
  }
  close() {
    this.open.set(false);
    this.unlockScroll();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open()) this.close();
  }

  /* --- приватные --- */
  private openMenu() {
    this.open.set(true);
    this.lockScroll();
  }

  /** Лочим скролл и компенсируем ширину скроллбара, чтобы не было «дрейфа» */
  private lockScroll() {
    const root = document.documentElement;
    const body = document.body;
    const sbw = window.innerWidth - root.clientWidth; // ширина вертикального скроллбара
    root.style.setProperty('--sbw', `${sbw}px`);
    root.classList.add('menu-open');
    body.classList.add('menu-open');
  }

  private unlockScroll() {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('menu-open');
    body.classList.remove('menu-open');
    root.style.removeProperty('--sbw');
  }
}
