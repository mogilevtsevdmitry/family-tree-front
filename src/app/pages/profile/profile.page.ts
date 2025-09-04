import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyTreeApiPort } from '../../core/api/domain/family-tree.api.port';
import { Person } from '../../core/api/domain/entities';
import { PhotoModalComponent } from '../../shared/components/photo-modal/photo-modal.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, PhotoModalComponent],
  styles: [
    `
      .wrap {
        margin-top: 24px;
      }
      .lg-card {
        padding: 16px;
        border-radius: 16px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--text-secondary);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
        background-color: var(--error-bg);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .error button {
        margin-top: 10px;
        padding: 8px 16px;
        background-color: var(--error-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .error button:hover {
        background-color: color-mix(in srgb, var(--error-color) 80%, black);
      }

      .profile-data {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-row strong {
        flex: 0 0 200px;
        color: var(--fg);
        font-weight: 600;
      }

      .info-row span {
        flex: 1;
        text-align: right;
        color: var(--text-secondary);
      }

      .photo-section {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
      }

      .photo-thumbnail {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        cursor: pointer;
        border: 3px solid var(--border-color);
        transition: border-color 0.3s ease, transform 0.2s ease;
      }

      .photo-thumbnail:hover {
        border-color: var(--lg-tint);
        transform: scale(1.05);
      }

      .photo-placeholder {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background-color: var(--surface);
        border: 3px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-size: 14px;
        text-align: center;
      }
    `,
  ],
  template: `
    <section class="wrap">
      <div class="lg-card">
        <h2 style="margin:0 0 16px 0;">Профиль пользователя</h2>

        <!-- Состояние загрузки -->
        @if (loading) {
        <div class="loading">
          <p>Загрузка данных профиля...</p>
        </div>
        }

        <!-- Сообщение об ошибке -->
        @if (error && !loading) {
        <div class="error">
          <p>{{ error }}</p>
          <button (click)="loadPersonDataPublic()">Повторить загрузку</button>
        </div>
        }
        <!-- Данные профиля -->
        @if (person && !loading && !error) {
        <!-- Секция с фото -->
        <div class="photo-section">
          @if (getUserPhotoUrl()) {
          <img
            [src]="getUserPhotoUrl()!"
            [alt]="getUserDisplayName()"
            class="photo-thumbnail"
            (click)="openPhotoModal()"
            (error)="onPhotoError($event)"
          />
          } @else {
          <div class="photo-placeholder">Нет фото</div>
          }
        </div>

        <div class="profile-data">
          <div class="info-row">
            <strong>ФИО:</strong>
            <span
              >{{ person.lastName || '' }} {{ person.firstName || '' }}
              {{ person.middleName || '' }}</span
            >
          </div>

          <div class="info-row">
            <strong>Дата рождения:</strong>
            <span>{{ person.birthDate && formatDate(person.birthDate!) }}</span>
          </div>

          <div class="info-row">
            <strong>Дата смерти:</strong>
            <span>{{ person.deathDate && formatDate(person.deathDate!) }}</span>
          </div>

          <div class="info-row">
            <strong>Место рождения:</strong>
            <span>{{ person.birthPlace }}</span>
          </div>

          <div class="info-row">
            <strong>Место проживания:</strong>
            <span>{{ person.residencePlace }}</span>
          </div>

          <div class="info-row">
            <strong>Пол:</strong>
            <span>{{ person.sex === 'male' ? 'Мужской' : 'Женский' }}</span>
          </div>

          <div class="info-row">
            <strong>Описание:</strong>
            <span>{{ person.description }}</span>
          </div>
        </div>
        }
      </div>

      <!-- Модальное окно для просмотра фото -->
      <app-photo-modal
        [isVisible]="isPhotoModalVisible"
        [photoUrl]="getUserPhotoUrl() || ''"
        [altText]="getUserDisplayName()"
        (close)="closePhotoModal()"
      />
    </section>
  `,
})
export class ProfilePage implements OnInit {
  private readonly api = inject(FamilyTreeApiPort);

  // Статические данные для тестирования
  private readonly personId = 'aa3dfb69-abbc-452d-b9d7-790db608b564';

  person: Person | null = null;
  loading = false;
  error: string | null = null;

  // Состояние модального окна фото
  isPhotoModalVisible = false;

  async ngOnInit() {
    await this.loadPersonData();
  }

  private async loadPersonData() {
    this.loading = true;
    this.error = null;

    try {
      this.person = await this.api.getPerson(this.personId);
      console.log('📡 [ProfilePage] Person data loaded successfully:', this.loading, this.error);
    } catch (err) {
      this.error = 'Ошибка загрузки данных профиля';
    } finally {
      this.loading = false;
    }
  }

  // Публичный метод для повторной загрузки (используется в шаблоне)
  async loadPersonDataPublic() {
    await this.loadPersonData();
  }

  // Форматирование даты
  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Методы для управления модальным окном фото
  openPhotoModal() {
    this.isPhotoModalVisible = true;
  }

  closePhotoModal() {
    this.isPhotoModalVisible = false;
  }

  // Получить URL фото пользователя
  getUserPhotoUrl(): string | null {
    return this.person?.user?.telegramPhoto || null;
  }

  // Получить имя пользователя для alt-текста
  getUserDisplayName(): string {
    if (!this.person) return 'Фото пользователя';
    const { firstName, lastName } = this.person;
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Фото пользователя';
  }

  // Обработка ошибки загрузки фото
  onPhotoError(event: Event) {
    console.error('Ошибка загрузки фото пользователя:', this.getUserPhotoUrl());
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
}
