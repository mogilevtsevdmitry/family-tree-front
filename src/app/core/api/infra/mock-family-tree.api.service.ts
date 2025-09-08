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
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '1',
        firstName: 'Дмитрий',
        lastName: 'Могилевцев',
        middleName: 'Александрович',
        birthDate: '1991-03-25',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.male,
        description: null,
        user: null,
      },
      {
        id: '2',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '2',
        firstName: 'Мария',
        lastName: 'Седлецкая',
        middleName: 'Сергеевна',
        birthDate: '1990-01-23',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.female,
        description: null,
        user: null,
      },
      {
        id: '3',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '3',
        firstName: 'Арина',
        lastName: 'Могилевцева',
        middleName: 'Дмитриевна',
        birthDate: '2019-09-03',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.female,
        description: null,
        user: null,
      },
      {
        id: '4',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '3',
        firstName: 'Ксения',
        lastName: 'Могилевцева',
        middleName: 'Дмитриевна',
        birthDate: '2014-04-02',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.female,
        description: null,
        user: null,
      },
      // {
      //   id: '5',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Алёна',
      //   lastName: 'Могилевцева',
      //   middleName: 'Александровна',
      //   birthDate: '1992-05-18',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.female,
      //   description: null,
      //   user: null,
      // },
      {
        id: '6',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '3',
        firstName: 'Александр',
        lastName: 'Могилевцев',
        middleName: 'Васильевич',
        birthDate: '1965-06-30',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.male,
        description: null,
        user: null,
      },
      {
        id: '7',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        userId: '3',
        firstName: 'Ирина',
        lastName: 'Могилевцева',
        middleName: 'Николаевна',
        birthDate: '1971-01-09',
        deathDate: null,
        birthPlace: null,
        residencePlace: null,
        sex: SexType.female,
        description: null,
        user: null,
      },
      // {
      //   id: '8',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Николай',
      //   lastName: 'Беда',
      //   middleName: 'Сергеевич',
      //   birthDate: '1944-11-01',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.male,
      //   description: null,
      //   user: null,
      // },
      // {
      //   id: '9',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Валентина',
      //   lastName: 'Беда',
      //   middleName: 'Ивановна',
      //   birthDate: '1948-08-17',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.female,
      //   description: null,
      //   user: null,
      // },
      // {
      //   id: '10',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Наталья',
      //   lastName: 'Вопилова',
      //   middleName: 'Сергеевна',
      //   birthDate: '1969-12-25',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.female,
      //   description: null,
      //   user: null,
      // },
      // {
      //   id: '11',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Андрей',
      //   lastName: 'Вопилов',
      //   middleName: 'Александрович',
      //   birthDate: '2000-01-25',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.male,
      //   description: null,
      //   user: null,
      // },
      // {
      //   id: '12',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Сергей',
      //   lastName: 'Седлецкий',
      //   middleName: 'Михайлович',
      //   birthDate: '1966-04-02',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.male,
      //   description: null,
      //   user: null,
      // },
      // {
      //   id: '13',
      //   createdAt: '2023-01-15T10:30:00Z',
      //   updatedAt: '2023-01-15T10:30:00Z',
      //   deletedAt: null,
      //   userId: '3',
      //   firstName: 'Наталья',
      //   lastName: 'Седлецкая',
      //   middleName: 'Тихоновна',
      //   birthDate: '1965-02-20',
      //   deathDate: null,
      //   birthPlace: null,
      //   residencePlace: null,
      //   sex: SexType.female,
      //   description: null,
      //   user: null,
      // },
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
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '2',
        toPersonId: '1',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '2',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '1',
        toPersonId: '2',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '3',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '1',
        toPersonId: '3',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '4',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '2',
        toPersonId: '3',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '5',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '1',
        toPersonId: '4',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '6',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '2',
        toPersonId: '4',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '11',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '6',
        toPersonId: '7',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '12',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '7',
        toPersonId: '6',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '13',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '6',
        toPersonId: '1',
        createdById: '1',
        type: RelationType.father,
      },
      {
        id: '14',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '7',
        toPersonId: '1',
        createdById: '1',
        type: RelationType.mother,
      },
      {
        id: '17',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '1',
        toPersonId: '5',
        createdById: '1',
        type: RelationType.brother,
      },
      {
        id: '19',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '8',
        toPersonId: '9',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '20',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '9',
        toPersonId: '8',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '21',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '8',
        toPersonId: '7',
        createdById: '1',
        type: RelationType.father,
      },
      {
        id: '22',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '9',
        toPersonId: '7',
        createdById: '1',
        type: RelationType.mother,
      },
      {
        id: '23',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '7',
        toPersonId: '8',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '24',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '7',
        toPersonId: '9',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '25',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '8',
        toPersonId: '10',
        createdById: '1',
        type: RelationType.father,
      },
      {
        id: '26',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '9',
        toPersonId: '10',
        createdById: '1',
        type: RelationType.mother,
      },
      {
        id: '27',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '10',
        toPersonId: '8',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '28',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '10',
        toPersonId: '9',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '29',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '7',
        toPersonId: '10',
        createdById: '1',
        type: RelationType.sister,
      },
      {
        id: '30',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '10',
        toPersonId: '7',
        createdById: '1',
        type: RelationType.sister,
      },
      {
        id: '31',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '10',
        toPersonId: '11',
        createdById: '1',
        type: RelationType.mother,
      },
      {
        id: '32',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '11',
        toPersonId: '10',
        createdById: '1',
        type: RelationType.son,
      },
      {
        id: '33',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '12',
        toPersonId: '13',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '34',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '13',
        toPersonId: '12',
        createdById: '1',
        type: RelationType.spouse,
      },
      {
        id: '35',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '12',
        toPersonId: '2',
        createdById: '1',
        type: RelationType.father,
      },
      {
        id: '36',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '13',
        toPersonId: '2',
        createdById: '1',
        type: RelationType.mother,
      },
      {
        id: '37',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '2',
        toPersonId: '12',
        createdById: '1',
        type: RelationType.daughter,
      },
      {
        id: '38',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        deletedAt: null,
        fromPersonId: '2',
        toPersonId: '13',
        createdById: '1',
        type: RelationType.daughter,
      },
    ];

    this.nextId = this.relations.length + 1;
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
