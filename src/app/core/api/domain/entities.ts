export enum SexType {
  male = 'male',
  female = 'female',
}

export enum RelationType {
  father = 'father',
  mother = 'mother',
  son = 'son',
  daughter = 'daughter',
  brother = 'brother',
  sister = 'sister',
  spouse = 'spouse', // опечатка в схеме? если нужно spouse — обсудим миграцию
}

export interface BaseEntity {
  id: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  deletedAt?: string | null; // ISO | null
}

export interface User extends BaseEntity {
  telegramId?: number | string | null;
  telegramUsername?: string | null;
  telegramPhoto?: string | null;
  isTelegramAuth: boolean;
}

export interface Person extends BaseEntity {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthDate?: string | null; // ISO
  deathDate?: string | null; // ISO
  birthPlace?: string | null;
  residencePlace?: string | null;
  sex?: SexType | null;
  description?: string | null;
  user?: User | null;
}

export interface Media extends BaseEntity {
  personId: string;
  fileUrl: string;
  title?: string | null;
  description?: string | null;
  dateTaken?: string | null; // ISO
}

export interface Relation extends BaseEntity {
  fromPersonId: string;
  toPersonId: string;
  createdById: string;
  type: RelationType;
}
