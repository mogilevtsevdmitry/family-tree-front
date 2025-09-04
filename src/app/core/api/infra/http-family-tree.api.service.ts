import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { User, Person, Media, Relation } from '../domain/entities';
import { firstValueFrom } from 'rxjs';
import { unwrapList } from './mappers';

function toQuery(p?: Pagination): string {
  if (!p) return '';
  const q = new URLSearchParams();
  if (typeof p.limit === 'number') q.set('limit', String(p.limit));
  if (typeof p.offset === 'number') q.set('offset', String(p.offset));
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

@Injectable()
export class HttpFamilyTreeApiService extends FamilyTreeApiPort {
  constructor(private http: HttpClient) {
    super();
    console.log('🚀 [HttpFamilyTreeApiService] Service initialized with HttpClient:', !!http);
  }

  // USERS
  async createUser(dto: CreateUserDto): Promise<User> {
    return firstValueFrom(this.http.post<User>('/users', dto));
  }
  async getUser(id: Id): Promise<User> {
    return firstValueFrom(this.http.get<User>(`/users/${id}`));
  }
  async listUsers(p?: Pagination): Promise<ListResponse<User>> {
    const raw = await firstValueFrom(this.http.get<any>(`/users${toQuery(p)}`));
    return unwrapList<User>(raw);
  }
  async updateUser(id: Id, dto: UpdateUserDto): Promise<User> {
    return firstValueFrom(this.http.patch<User>(`/users/${id}`, dto));
  }
  async deleteUser(id: Id): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/users/${id}`));
  }

  // PERSONS
  async createPerson(dto: CreatePersonDto): Promise<Person> {
    console.log('🔄 [HttpFamilyTreeApiService] Creating person:', dto);
    return firstValueFrom(this.http.post<Person>('/persons', dto));
  }
  async getPerson(id: Id): Promise<Person> {
    console.log('🔄 [HttpFamilyTreeApiService] Getting person by ID:', id);
    console.log('🔄 [HttpFamilyTreeApiService] URL will be:', `/persons/${id}`);
    return firstValueFrom(this.http.get<Person>(`/persons/${id}`));
  }
  async listPersons(p?: Pagination): Promise<ListResponse<Person>> {
    const raw = await firstValueFrom(this.http.get<any>(`/persons${toQuery(p)}`));
    return unwrapList<Person>(raw);
  }
  async updatePerson(id: Id, dto: UpdatePersonDto): Promise<Person> {
    return firstValueFrom(this.http.patch<Person>(`/persons/${id}`, dto));
  }
  async deletePerson(id: Id): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/persons/${id}`));
  }

  // RELATIONS
  async createRelation(dto: CreateRelationDto): Promise<Relation> {
    return firstValueFrom(this.http.post<Relation>('/relations', dto));
  }
  async getRelation(id: Id): Promise<Relation> {
    return firstValueFrom(this.http.get<Relation>(`/relations/${id}`));
  }
  async listRelations(p?: Pagination): Promise<ListResponse<Relation>> {
    const raw = await firstValueFrom(this.http.get<any>(`/relations${toQuery(p)}`));
    return unwrapList<Relation>(raw);
  }
  async updateRelation(id: Id, dto: UpdateRelationDto): Promise<Relation> {
    return firstValueFrom(this.http.patch<Relation>(`/relations/${id}`, dto));
  }
  async deleteRelation(id: Id): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/relations/${id}`));
  }

  // MEDIA
  async createMedia(dto: CreateMediaDto): Promise<Media> {
    return firstValueFrom(this.http.post<Media>('/media', dto));
  }
  async getMedia(id: Id): Promise<Media> {
    return firstValueFrom(this.http.get<Media>(`/media/${id}`));
  }
  async listMedia(p?: Pagination): Promise<ListResponse<Media>> {
    const raw = await firstValueFrom(this.http.get<any>(`/media${toQuery(p)}`));
    return unwrapList<Media>(raw);
  }
  async updateMedia(id: Id, dto: UpdateMediaDto): Promise<Media> {
    return firstValueFrom(this.http.patch<Media>(`/media/${id}`, dto));
  }
  async deleteMedia(id: Id): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/media/${id}`));
  }
}
