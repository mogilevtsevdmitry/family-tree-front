import {
  Pagination,
  ListResponse,
  Id,
  CreateUserDto,
  UpdateUserDto,
  CreatePersonDto,
  UpdatePersonDto,
  CreateMediaDto,
  UpdateMediaDto,
  CreateRelationDto,
  UpdateRelationDto,
} from './dtos';

import { User, Person, Media, Relation } from './entities';

export abstract class FamilyTreeApiPort {
  // USERS
  abstract createUser(dto: CreateUserDto): Promise<User>;
  abstract getUser(id: Id): Promise<User>;
  abstract listUsers(p?: Pagination): Promise<ListResponse<User>>;
  abstract updateUser(id: Id, dto: UpdateUserDto): Promise<User>;
  abstract deleteUser(id: Id): Promise<void>;

  // PERSONS
  abstract createPerson(dto: CreatePersonDto): Promise<Person>;
  abstract getPerson(id: Id): Promise<Person>;
  abstract listPersons(p?: Pagination): Promise<ListResponse<Person>>;
  abstract updatePerson(id: Id, dto: UpdatePersonDto): Promise<Person>;
  abstract deletePerson(id: Id): Promise<void>;

  // RELATIONS
  abstract createRelation(dto: CreateRelationDto): Promise<Relation>;
  abstract getRelation(id: Id): Promise<Relation>;
  abstract listRelations(p?: Pagination): Promise<ListResponse<Relation>>;
  abstract updateRelation(id: Id, dto: UpdateRelationDto): Promise<Relation>;
  abstract deleteRelation(id: Id): Promise<void>;

  // MEDIA
  abstract createMedia(dto: CreateMediaDto): Promise<Media>;
  abstract getMedia(id: Id): Promise<Media>;
  abstract listMedia(p?: Pagination): Promise<ListResponse<Media>>;
  abstract updateMedia(id: Id, dto: UpdateMediaDto): Promise<Media>;
  abstract deleteMedia(id: Id): Promise<void>;
}
