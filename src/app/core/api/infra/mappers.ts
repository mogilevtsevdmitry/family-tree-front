export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

export function unwrapList<T>(raw: any): ApiListResponse<T> {
  if (Array.isArray(raw)) return { items: raw as T[], total: raw.length };
  if (raw && Array.isArray(raw.items) && typeof raw.total === 'number') return raw;
  const items = raw?.items ?? [];
  return { items, total: Number(raw?.total ?? items.length ?? 0) };
}
