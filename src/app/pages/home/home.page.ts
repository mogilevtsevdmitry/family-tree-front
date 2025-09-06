import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FamilyTreeComponent } from '../../shared/components/family-tree/family-tree.component';
import { Person, Relation } from '../../core/api/domain/entities';
import { FamilyTreeDataService } from '../../shared/services/family-tree-data.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FamilyTreeComponent],
  styleUrls: ['./home.page.scss'],
  template: `
    <div *ngIf="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка семейного дерева...</p>
    </div>

    <div *ngIf="error" class="error-container">
      <div class="error-message">
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <button (click)="loadFamilyTreeData()" class="retry-button">Попробовать снова</button>
      </div>
    </div>

    <app-family-tree
      *ngIf="!isLoading && !error"
      [persons]="persons"
      [relations]="relations"
      [currentUserId]="currentUserId"
    ></app-family-tree>
  `,
})
export class HomePage implements OnInit {
  persons: Person[] = [];
  relations: Relation[] = [];
  currentUserId = '';
  isLoading = true;
  error: string | null = null;

  constructor(private familyTreeDataService: FamilyTreeDataService) {}

  async ngOnInit(): Promise<void> {
    await this.loadFamilyTreeData();
  }

  async loadFamilyTreeData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Загружаем данные параллельно
      const [data, currentUserId] = await Promise.all([
        this.familyTreeDataService.loadFamilyTreeData(),
        this.familyTreeDataService.getCurrentUserId(),
      ]);

      this.persons = data.persons;
      this.relations = data.relations;
      this.currentUserId = currentUserId;
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      this.error = 'Не удалось загрузить данные семейного дерева';
    } finally {
      this.isLoading = false;
    }
  }
}
