import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-modal',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
      }

      .modal-content {
        max-width: 90%;
        max-height: 90%;
        position: relative;
      }

      .modal-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .close-button {
        position: absolute;
        top: -40px;
        right: 0;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
      }

      .close-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `,
  ],
  template: `
    @if (isVisible) {
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-button" (click)="closeModal()" type="button">×</button>
        <img [src]="photoUrl" [alt]="altText" class="modal-image" (error)="onImageError()" />
      </div>
    </div>
    }
  `,
})
export class PhotoModalComponent {
  @Input() isVisible = false;
  @Input() photoUrl = '';
  @Input() altText = 'Фото пользователя';

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  onImageError() {
    console.error('Ошибка загрузки фото:', this.photoUrl);
  }
}
