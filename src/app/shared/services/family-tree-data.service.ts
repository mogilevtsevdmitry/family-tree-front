import { Injectable } from '@angular/core';
import { FamilyTreeApiPort } from '../../core/api/domain/family-tree.api.port';
import { Person, Relation } from '../../core/api/domain/entities';

@Injectable({
  providedIn: 'root',
})
export class FamilyTreeDataService {
  constructor(private familyTreeApi: FamilyTreeApiPort) {}

  async loadFamilyTreeData(): Promise<{ persons: Person[]; relations: Relation[] }> {
    try {
      // Загружаем персон и связи параллельно
      const [personsResponse, relationsResponse] = await Promise.all([
        this.familyTreeApi.listPersons(),
        this.familyTreeApi.listRelations(),
      ]);

      return {
        persons: personsResponse.items,
        relations: relationsResponse.items,
      };
    } catch (error) {
      console.error('Ошибка загрузки данных семейного дерева:', error);
      throw error;
    }
  }

  async getCurrentUserId(): Promise<string> {
    try {
      // В реальном приложении здесь будет логика получения ID текущего пользователя
      // Пока возвращаем ID первого пользователя из моковых данных
      const usersResponse = await this.familyTreeApi.listUsers();
      return usersResponse.items[0]?.id || '1';
    } catch (error) {
      console.error('Ошибка получения ID текущего пользователя:', error);
      return '1'; // Fallback значение
    }
  }
}
