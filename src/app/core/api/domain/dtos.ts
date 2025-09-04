import { SexType } from './entities';

export type Id = string;

export interface Pagination {
  limit?: number;
  offset?: number;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface CreateUserDto {
  telegramId?: number | string | null;
  telegramUsername?: string | null;
  telegramPhoto?: string | null;
  isTelegramAuth?: boolean; // обычно проставляет бэкенд после верификации
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface CreatePersonDto {
  userId: string;
  lastName?: string | null;
  middleName?: string | null;
  birthDate?: string | null; // ISO
  deathDate?: string | null; // ISO
  birthPlace?: string | null;
  residencePlace?: string | null;
  sex?: SexType | null;
  description?: string | null;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {}

export interface CreateMediaDto {
  personId: string;
  fileUrl: string; // если будет загрузка файла — заведём отдельный endpoint
  title?: string | null;
  description?: string | null;
  dateTaken?: string | null; // ISO
}

export interface UpdateMediaDto extends Partial<CreateMediaDto> {}

export interface CreateRelationDto {
  fromPersonId: string;
  toPersonId: string;
  createdById: string;
  type: import('./entities').RelationType;
}

export interface UpdateRelationDto extends Partial<CreateRelationDto> {}
