import { Person, Relation, RelationType } from '../../core/api/domain/entities';

export interface TreePerson extends Person {
  x: number;
  y: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface TreeRelation {
  from: TreePerson;
  to: TreePerson;
  type: RelationType;
}

export interface TreePosition {
  x: number;
  y: number;
}

export interface TreeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface TreeConfig {
  cardWidth: number;
  cardHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  spouseSpacing: number;
  minScale: number;
  maxScale: number;
}
