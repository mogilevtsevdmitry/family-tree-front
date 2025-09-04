import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyTreeApiPort } from '../../core/api/domain/family-tree.api.port';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .hero {
        margin-top: 24px;
      }
      .lg-card {
        padding: 16px;
        border-radius: 16px;
      }
    `,
  ],
  template: `
    <section class="hero">
      <div class="lg-card">
        <h1 style="margin:0 0 8px 0;">Family Tree</h1>
        <p>Главный экран. Тут позже будет контент.</p>

        <!-- Кнопка тестирования API -->
        <div style="margin-top: 20px;">
          <h3>Тестирование API:</h3>
          <button
            (click)="testApiConnection()"
            style="margin-right: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Проверить API
          </button>
          <button
            (click)="testGetPerson()"
            style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Получить Person
          </button>
        </div>

        <!-- Результаты тестирования -->
        <div
          [@if]="testResult"
          style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; white-space: pre-wrap;"
        >
          {{ testResult }}
        </div>
      </div>
    </section>
  `,
})
export class HomePage {
  private readonly api = inject(FamilyTreeApiPort);
  testResult = '';

  async testApiConnection() {
    console.log('🧪 [HomePage] Testing API connection...');
    this.testResult = '🔄 Тестирую подключение к API...\n';

    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        this.testResult += '✅ API доступен!\n';
      } else {
        this.testResult += `⚠️ API вернул статус: ${response.status}\n`;
      }
    } catch (error) {
      this.testResult += `❌ Ошибка подключения к API: ${error}\n`;
    }
  }

  async testGetPerson() {
    console.log('🧪 [HomePage] Testing getPerson API...');
    const personId = 'aa3dfb69-abbc-452d-b9d7-790db608b564';
    this.testResult = `🔄 Тестирую получение Person с ID: ${personId}...\n`;

    try {
      console.log('📡 [HomePage] Calling API getPerson...');
      const person = await this.api.getPerson(personId);
      this.testResult += `✅ Person получен успешно!\n`;
      this.testResult += `👤 Данные: ${JSON.stringify(person, null, 2)}\n`;
      console.log('✅ [HomePage] Person data:', person);
    } catch (error) {
      this.testResult += `❌ Ошибка получения Person: ${error}\n`;
      console.error('❌ [HomePage] Error:', error);
    }
  }
}
