import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TreePerson } from '../../interfaces/tree.interface';

@Component({
  selector: 'app-person-card',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .person-card {
        position: absolute;
        width: 200px;
        height: 120px;
        background: var(--surface-color, #ffffff);
        border: 2px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }

      .person-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      }

      .person-card.current-user {
        border-color: var(--primary-color, #007bff);
        background: var(--primary-light, #f0f8ff);
      }

      .person-card.male {
        border-left: 4px solid #4a90e2;
      }

      .person-card.female {
        border-left: 4px solid #e24a90;
      }

      .person-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .person-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--surface-secondary, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        font-size: 14px;
        font-weight: bold;
        color: var(--text-secondary, #666);
      }

      .person-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-primary, #333);
        margin: 0;
        line-height: 1.2;
      }

      .person-details {
        font-size: 12px;
        color: var(--text-secondary, #666);
        line-height: 1.3;
      }

      .person-birth {
        margin-bottom: 2px;
      }

      .person-location {
        font-style: italic;
      }
    `,
  ],
  template: `
    <div
      class="person-card"
      [class.current-user]="person.isCurrentUser"
      [class.male]="person.sex === 'male'"
      [class.female]="person.sex === 'female'"
      [style.left.px]="person.x"
      [style.top.px]="person.y"
      (click)="onPersonClick()"
    >
      <div class="person-header">
        <div class="person-avatar">
          {{ getInitials() }}
        </div>
        <h3 class="person-name">{{ getFullName() }}</h3>
      </div>

      <div class="person-details">
        <div class="person-birth" *ngIf="person.birthDate">
          {{ formatDate(person.birthDate) }}
        </div>
        <div class="person-location" *ngIf="person.birthPlace">
          {{ person.birthPlace }}
        </div>
      </div>
    </div>
  `,
})
export class PersonCardComponent {
  @Input() person!: TreePerson;
  @Output() personClick = new EventEmitter<string>();

  getInitials(): string {
    const firstName = this.person.firstName || '';
    const lastName = this.person.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || '?';
  }

  getFullName(): string {
    const parts = [this.person.firstName, this.person.middleName, this.person.lastName].filter(
      Boolean
    );

    return parts.join(' ') || 'Неизвестно';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  onPersonClick(): void {
    this.personClick.emit(this.person.id);
  }
}
