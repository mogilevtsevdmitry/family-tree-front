import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tree-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-controls">
      <button
        class="control-button"
        (click)="onZoomIn()"
        [disabled]="scale >= maxScale"
        title="Увеличить"
      >
        +
      </button>
      <button
        class="control-button"
        (click)="onZoomOut()"
        [disabled]="scale <= minScale"
        title="Уменьшить"
      >
        −
      </button>
      <button class="control-button" (click)="onResetView()" title="Сбросить вид">⌂</button>
    </div>

    <!-- Информация о масштабе -->
    <div class="zoom-info">Масштаб: {{ scale * 100 | number : '1.0-0' }}%</div>
  `,
  styles: [
    `
      .tree-controls {
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1000;
      }

      .control-button {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: var(--surface-color, rgba(255, 255, 255, 0.9));
        color: var(--text-primary, #333);
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
      }

      .control-button:hover:not(:disabled) {
        background: var(--surface-hover, rgba(255, 255, 255, 1));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .control-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .control-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .zoom-info {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: var(--surface-color, rgba(255, 255, 255, 0.9));
        color: var(--text-secondary, #666);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        z-index: 1000;
      }
    `,
  ],
})
export class TreeControlsComponent {
  @Input() scale: number = 1;
  @Input() minScale: number = 0.3;
  @Input() maxScale: number = 2.0;

  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() resetView = new EventEmitter<void>();

  onZoomIn(): void {
    this.zoomIn.emit();
  }

  onZoomOut(): void {
    this.zoomOut.emit();
  }

  onResetView(): void {
    this.resetView.emit();
  }
}
