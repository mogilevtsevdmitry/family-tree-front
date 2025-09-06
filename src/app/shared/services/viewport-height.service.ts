import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewportHeightService {
  private readonly headerHeight = signal(0);
  private readonly windowHeight = signal(0);

  // Вычисляемая высота для контента (вся высота окна минус высота header)
  readonly contentHeight = computed(() => {
    const header = this.headerHeight();
    const window = this.windowHeight();
    return Math.max(0, window - header - 48); // 48 - padding
  });

  constructor() {
    this.initializeHeight();
    this.setupResizeListener();
  }

  private initializeHeight(): void {
    this.updateHeights();
  }

  private setupResizeListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.updateHeights();
      });
    }
  }

  private updateHeights(): void {
    if (typeof window !== 'undefined') {
      this.windowHeight.set(window.innerHeight);

      // Находим header элемент и получаем его высоту
      const headerElement = document.querySelector('app-header header');
      if (headerElement) {
        const rect = headerElement.getBoundingClientRect();
        this.headerHeight.set(rect.height);
      } else {
        // Fallback: предполагаем стандартную высоту header
        this.headerHeight.set(60);
      }
    }
  }

  /**
   * Принудительно обновляет высоты (можно вызвать после изменения DOM)
   */
  refreshHeights(): void {
    this.updateHeights();
  }

  /**
   * Возвращает CSS значение для высоты контента
   */
  getContentHeightCss(): string {
    const contentHeight = `${this.contentHeight()}px`;
    console.log({ contentHeight });
    return contentHeight;
  }
}
