import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyTreeApiPort } from '../../core/api/domain/family-tree.api.port';
import { Person } from '../../core/api/domain/entities';
import { PhotoModalComponent } from '../../shared/components/photo-modal/photo-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, PhotoModalComponent],
  styleUrl: './profile.scss',
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
  private readonly personId = environment.useMockApi ? '1' : 'aa3dfb69-abbc-452d-b9d7-790db608b564';

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
