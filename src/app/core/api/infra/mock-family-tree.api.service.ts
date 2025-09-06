import { Injectable } from '@angular/core';
import { FamilyTreeApiPort } from '../domain/family-tree.api.port';
import {
  Id,
  Pagination,
  ListResponse,
  CreateUserDto,
  UpdateUserDto,
  CreatePersonDto,
  UpdatePersonDto,
  CreateMediaDto,
  UpdateMediaDto,
  CreateRelationDto,
  UpdateRelationDto,
} from '../domain/dtos';
import { User, Person, Media, Relation, SexType, RelationType } from '../domain/entities';
import { unwrapList } from './mappers';

@Injectable()
export class MockFamilyTreeApiService extends FamilyTreeApiPort {
  private users: User[] = [];
  private persons: Person[] = [];
  private media: Media[] = [];
  private relations: Relation[] = [];
  private nextId = 1;

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Инициализируем тестовые данные
    this.users = [
      {
        id: '1',
        telegramId: 123456789,
        telegramUsername: 'test_user',
        telegramPhoto: 'https://via.placeholder.com/150',
        isTelegramAuth: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        telegramId: 987654321,
        telegramUsername: 'another_user',
        telegramPhoto: 'https://via.placeholder.com/150',
        isTelegramAuth: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    this.persons = [
      {
        id: '1',
        userId: '1',
        firstName: 'Иван',
        lastName: 'Иванов',
        middleName: 'Петрович',
        birthDate: '1990-05-15',
        birthPlace: 'Москва',
        residencePlace: 'Санкт-Петербург',
        sex: SexType.male,
        description: 'Основатель семейного древа',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        userId: '1',
        firstName: 'Мария',
        lastName: 'Иванова',
        middleName: 'Сергеевна',
        birthDate: '1992-08-20',
        birthPlace: 'Санкт-Петербург',
        residencePlace: 'Санкт-Петербург',
        sex: SexType.female,
        description: 'Жена Ивана',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        userId: '2',
        firstName: 'Алексей',
        lastName: 'Петров',
        middleName: 'Иванович',
        birthDate: '1985-03-10',
        birthPlace: 'Новосибирск',
        residencePlace: 'Москва',
        sex: SexType.male,
        description: 'Друг семьи',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    this.media = [
      {
        id: '1',
        personId: '1',
        fileUrl: 'https://via.placeholder.com/300x400',
        title: 'Фото Ивана',
        description: 'Портретное фото',
        dateTaken: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        personId: '2',
        fileUrl: 'https://via.placeholder.com/300x400',
        title: 'Фото Марии',
        description: 'Семейное фото',
        dateTaken: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    this.relations = [
      {
        id: '1',
        fromPersonId: '1',
        toPersonId: '2',
        createdById: '1',
        type: RelationType.spouse,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    this.nextId = 4;
  }

  private generateId(): string {
    return String(this.nextId++);
  }

  private generateTimestamps() {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now,
    };
  }

  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private applyPagination<T>(items: T[], pagination?: Pagination): T[] {
    if (!pagination) return items;

    const { limit, offset = 0 } = pagination;
    const start = offset;
    const end = limit ? start + limit : undefined;

    return items.slice(start, end);
  }

  // USERS
  async createUser(dto: CreateUserDto): Promise<User> {
    await this.simulateDelay();

    const user: User = {
      id: this.generateId(),
      telegramId: dto.telegramId ?? null,
      telegramUsername: dto.telegramUsername ?? null,
      telegramPhoto: dto.telegramPhoto ?? null,
      isTelegramAuth: dto.isTelegramAuth ?? false,
      ...this.generateTimestamps(),
    };

    this.users.push(user);
    return user;
  }

  async getUser(id: Id): Promise<User> {
    await this.simulateDelay();

    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  async listUsers(p?: Pagination): Promise<ListResponse<User>> {
    await this.simulateDelay();

    const paginatedUsers = this.applyPagination(this.users, p);
    return {
      items: paginatedUsers,
      total: this.users.length,
    };
  }

  async updateUser(id: Id, dto: UpdateUserDto): Promise<User> {
    await this.simulateDelay();

    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: Id): Promise<void> {
    await this.simulateDelay();

    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    this.users.splice(userIndex, 1);

    // Также удаляем связанных персон
    this.persons = this.persons.filter((p) => p.userId !== id);
  }

  // PERSONS
  async createPerson(dto: CreatePersonDto): Promise<Person> {
    await this.simulateDelay();

    const person: Person = {
      id: this.generateId(),
      userId: dto.userId,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      middleName: dto.middleName ?? null,
      birthDate: dto.birthDate ?? null,
      deathDate: dto.deathDate ?? null,
      birthPlace: dto.birthPlace ?? null,
      residencePlace: dto.residencePlace ?? null,
      sex: dto.sex ?? null,
      description: dto.description ?? null,
      ...this.generateTimestamps(),
    };

    this.persons.push(person);
    return person;
  }

  async getPerson(id: Id): Promise<Person> {
    await this.simulateDelay();

    const person = this.persons.find((p) => p.id === id);
    if (!person) {
      throw new Error(`Person with id ${id} not found`);
    }

    return person;
  }

  async listPersons(p?: Pagination): Promise<ListResponse<Person>> {
    await this.simulateDelay();

    const paginatedPersons = this.applyPagination(this.persons, p);
    return {
      items: paginatedPersons,
      total: this.persons.length,
    };
  }

  async updatePerson(id: Id, dto: UpdatePersonDto): Promise<Person> {
    await this.simulateDelay();

    const personIndex = this.persons.findIndex((p) => p.id === id);
    if (personIndex === -1) {
      throw new Error(`Person with id ${id} not found`);
    }

    const updatedPerson: Person = {
      ...this.persons[personIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.persons[personIndex] = updatedPerson;
    return updatedPerson;
  }

  async deletePerson(id: Id): Promise<void> {
    await this.simulateDelay();

    const personIndex = this.persons.findIndex((p) => p.id === id);
    if (personIndex === -1) {
      throw new Error(`Person with id ${id} not found`);
    }

    this.persons.splice(personIndex, 1);

    // Также удаляем связанные медиа и отношения
    this.media = this.media.filter((m) => m.personId !== id);
    this.relations = this.relations.filter((r) => r.fromPersonId !== id || r.toPersonId !== id);
  }

  // RELATIONS
  async createRelation(dto: CreateRelationDto): Promise<Relation> {
    await this.simulateDelay();

    const relation: Relation = {
      id: this.generateId(),
      fromPersonId: dto.fromPersonId,
      toPersonId: dto.toPersonId,
      createdById: dto.createdById,
      type: dto.type,
      ...this.generateTimestamps(),
    };

    this.relations.push(relation);
    return relation;
  }

  async getRelation(id: Id): Promise<Relation> {
    await this.simulateDelay();

    const relation = this.relations.find((r) => r.id === id);
    if (!relation) {
      throw new Error(`Relation with id ${id} not found`);
    }

    return relation;
  }

  async listRelations(p?: Pagination): Promise<ListResponse<Relation>> {
    await this.simulateDelay();

    const paginatedRelations = this.applyPagination(this.relations, p);
    return {
      items: paginatedRelations,
      total: this.relations.length,
    };
  }

  async updateRelation(id: Id, dto: UpdateRelationDto): Promise<Relation> {
    await this.simulateDelay();

    const relationIndex = this.relations.findIndex((r) => r.id === id);
    if (relationIndex === -1) {
      throw new Error(`Relation with id ${id} not found`);
    }

    const updatedRelation: Relation = {
      ...this.relations[relationIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.relations[relationIndex] = updatedRelation;
    return updatedRelation;
  }

  async deleteRelation(id: Id): Promise<void> {
    await this.simulateDelay();

    const relationIndex = this.relations.findIndex((r) => r.id === id);
    if (relationIndex === -1) {
      throw new Error(`Relation with id ${id} not found`);
    }

    this.relations.splice(relationIndex, 1);
  }

  // MEDIA
  async createMedia(dto: CreateMediaDto): Promise<Media> {
    await this.simulateDelay();

    const media: Media = {
      id: this.generateId(),
      personId: dto.personId,
      fileUrl: dto.fileUrl,
      title: dto.title ?? null,
      description: dto.description ?? null,
      dateTaken: dto.dateTaken ?? null,
      ...this.generateTimestamps(),
    };

    this.media.push(media);
    return media;
  }

  async getMedia(id: Id): Promise<Media> {
    await this.simulateDelay();

    const media = this.media.find((m) => m.id === id);
    if (!media) {
      throw new Error(`Media with id ${id} not found`);
    }

    return media;
  }

  async listMedia(p?: Pagination): Promise<ListResponse<Media>> {
    await this.simulateDelay();

    const paginatedMedia = this.applyPagination(this.media, p);
    return {
      items: paginatedMedia,
      total: this.media.length,
    };
  }

  async updateMedia(id: Id, dto: UpdateMediaDto): Promise<Media> {
    await this.simulateDelay();

    const mediaIndex = this.media.findIndex((m) => m.id === id);
    if (mediaIndex === -1) {
      throw new Error(`Media with id ${id} not found`);
    }

    const updatedMedia: Media = {
      ...this.media[mediaIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.media[mediaIndex] = updatedMedia;
    return updatedMedia;
  }

  async deleteMedia(id: Id): Promise<void> {
    await this.simulateDelay();

    const mediaIndex = this.media.findIndex((m) => m.id === id);
    if (mediaIndex === -1) {
      throw new Error(`Media with id ${id} not found`);
    }

    this.media.splice(mediaIndex, 1);
  }
}
