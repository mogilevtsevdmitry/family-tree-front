import { Injectable } from '@angular/core';
import { Person, Relation, RelationType } from '../../core/api/domain/entities';
import { TreePerson, TreeRelation, TreeConfig, TreeBounds } from '../interfaces/tree.interface';

@Injectable({
  providedIn: 'root',
})
export class TreeLayoutService {
  private config: TreeConfig = {
    cardWidth: 200,
    cardHeight: 120,
    horizontalSpacing: 300, // Увеличиваем горизонтальное расстояние
    verticalSpacing: 200,
    spouseSpacing: 40,
    minScale: 0.3,
    maxScale: 2.0,
  };

  calculateTreeLayout(
    persons: Person[],
    relations: Relation[],
    currentUserId: string
  ): { treePersons: TreePerson[]; treeRelations: TreeRelation[]; bounds: TreeBounds } {
    const treePersons = this.convertToTreePersons(persons, currentUserId);
    const treeRelations = this.convertToTreeRelations(relations, treePersons);

    // Находим текущего пользователя
    const currentUser = treePersons.find((p) => p.isCurrentUser);
    if (!currentUser) {
      return { treePersons, treeRelations, bounds: this.calculateBounds(treePersons) };
    }

    // Строим иерархию от текущего пользователя
    const hierarchy = this.buildHierarchy(currentUser, treePersons, treeRelations);

    // Рассчитываем позиции
    this.calculatePositions(hierarchy, currentUser);

    const bounds = this.calculateBounds(treePersons);

    return { treePersons, treeRelations, bounds };
  }

  private convertToTreePersons(persons: Person[], currentUserId: string): TreePerson[] {
    return persons.map((person) => ({
      ...person,
      x: 0,
      y: 0,
      level: 0,
      isCurrentUser: person.userId === currentUserId,
    }));
  }

  private convertToTreeRelations(relations: Relation[], treePersons: TreePerson[]): TreeRelation[] {
    const personMap = new Map(treePersons.map((p) => [p.id, p]));

    return relations
      .map((relation) => {
        const from = personMap.get(relation.fromPersonId);
        const to = personMap.get(relation.toPersonId);

        if (!from || !to) return null;

        return {
          from,
          to,
          type: relation.type,
        };
      })
      .filter(Boolean) as TreeRelation[];
  }

  private buildHierarchy(
    currentUser: TreePerson,
    treePersons: TreePerson[],
    treeRelations: TreeRelation[]
  ): Map<string, TreePerson[]> {
    const hierarchy = new Map<string, TreePerson[]>();
    const visited = new Set<string>();

    // Начинаем с текущего пользователя (уровень 0)
    hierarchy.set(currentUser.id, [currentUser]);
    visited.add(currentUser.id);

    // Находим родителей
    const parents = this.findParents(currentUser, treeRelations);
    if (parents.length > 0) {
      hierarchy.set('parents', parents);
      parents.forEach((parent) => visited.add(parent.id));
    }

    // Находим супруга/супругу
    const spouse = this.findSpouse(currentUser, treeRelations);
    if (spouse) {
      hierarchy.set('spouse', [spouse]);
      visited.add(spouse.id);
    }

    // Находим братьев и сестер
    const siblings = this.findSiblings(currentUser, treeRelations);
    if (siblings.length > 0) {
      hierarchy.set('siblings', siblings);
      siblings.forEach((sibling) => visited.add(sibling.id));
    }

    // Находим детей
    const children = this.findChildren(currentUser, treeRelations);
    if (children.length > 0) {
      hierarchy.set('children', children);
      children.forEach((child) => visited.add(child.id));
    }

    return hierarchy;
  }

  private findParents(person: TreePerson, relations: TreeRelation[]): TreePerson[] {
    return relations
      .filter(
        (rel) =>
          rel.to.id === person.id &&
          (rel.type === RelationType.father || rel.type === RelationType.mother)
      )
      .map((rel) => rel.from);
  }

  private findSpouse(person: TreePerson, relations: TreeRelation[]): TreePerson | null {
    const spouseRelation = relations.find(
      (rel) =>
        (rel.from.id === person.id || rel.to.id === person.id) && rel.type === RelationType.spouse
    );

    if (!spouseRelation) return null;

    return spouseRelation.from.id === person.id ? spouseRelation.to : spouseRelation.from;
  }

  private findSiblings(person: TreePerson, relations: TreeRelation[]): TreePerson[] {
    const parents = this.findParents(person, relations);
    if (parents.length === 0) return [];

    const parentIds = parents.map((p) => p.id);

    return relations
      .filter(
        (rel) =>
          parentIds.includes(rel.to.id) &&
          (rel.type === RelationType.son || rel.type === RelationType.daughter) &&
          rel.from.id !== person.id
      )
      .map((rel) => rel.from);
  }

  private findChildren(person: TreePerson, relations: TreeRelation[]): TreePerson[] {
    return relations
      .filter(
        (rel) =>
          rel.from.id === person.id &&
          (rel.type === RelationType.son || rel.type === RelationType.daughter)
      )
      .map((rel) => rel.to);
  }

  private calculatePositions(hierarchy: Map<string, TreePerson[]>, currentUser: TreePerson): void {
    // Центрируем текущего пользователя
    currentUser.x = 0;
    currentUser.y = 0;
    currentUser.level = 0;

    // Размещаем родителей выше
    const parents = hierarchy.get('parents') || [];
    if (parents.length > 0) {
      parents.forEach((parent, index) => {
        parent.x = (index - (parents.length - 1) / 2) * this.config.horizontalSpacing;
        parent.y = -this.config.verticalSpacing;
        parent.level = -1;
      });
    }

    // Размещаем супруга справа от текущего пользователя
    const spouse = hierarchy.get('spouse')?.[0];
    if (spouse) {
      spouse.x = this.config.horizontalSpacing * 0.8;
      spouse.y = 0;
      spouse.level = 0;
    }

    // Размещаем братьев и сестер слева от текущего пользователя
    const siblings = hierarchy.get('siblings') || [];
    if (siblings.length > 0) {
      // Размещаем братьев и сестер слева, учитывая наличие супруга
      const hasSpouse = spouse !== undefined;
      const startX = hasSpouse
        ? -this.config.horizontalSpacing * (siblings.length + 1.2)
        : -this.config.horizontalSpacing * (siblings.length + 0.5);

      siblings.forEach((sibling, index) => {
        sibling.x = startX + index * this.config.horizontalSpacing;
        sibling.y = 0;
        sibling.level = 0;
      });
    }

    // Размещаем детей ниже
    const children = hierarchy.get('children') || [];
    if (children.length > 0) {
      children.forEach((child, index) => {
        child.x = (index - (children.length - 1) / 2) * this.config.horizontalSpacing;
        child.y = this.config.verticalSpacing;
        child.level = 1;
      });
    }
  }

  private calculateBounds(treePersons: TreePerson[]): TreeBounds {
    if (treePersons.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const xs = treePersons.map((p) => p.x);
    const ys = treePersons.map((p) => p.y);

    return {
      minX: Math.min(...xs) - this.config.cardWidth / 2,
      maxX: Math.max(...xs) + this.config.cardWidth / 2,
      minY: Math.min(...ys) - this.config.cardHeight / 2,
      maxY: Math.max(...ys) + this.config.cardHeight / 2,
    };
  }

  getConfig(): TreeConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<TreeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
