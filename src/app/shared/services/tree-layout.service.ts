import { Injectable } from '@angular/core';
import { Person, Relation, RelationType, SexType } from '../../core/api/domain/entities';
import { TreeBounds, TreeConfig, TreePerson, TreeRelation } from '../interfaces/tree.interface';
interface PositionedNode {
  id: string; // personId
  x: number; // координата центра
  y: number; // координата центра
  level: number; // 0 — корень, >0 — потомки, <0 — предки
  parents: string[]; // personIds родителей
  children: string[]; // personIds детей
  spouses: string[]; // personIds супругов
  siblings: string[]; // personIds братьев/сестер
}

interface Edge {
  from: string; // personId
  to: string; // personId
  kind: 'parent' | 'spouse' | 'sibling';
}

interface FamilyUnit {
  id: string; // стабильный ключ: couple:p1|p2 или single:p
  partners: string[]; // [p1, p2] или [p]
  children: string[]; // ids
  level: number; // уровень юнита
  cx: number; // центр юнита по X (используется для центрирования детей)
}

interface NormalizedRelations {
  spouses: Map<string, Set<string>>;
  parentsOf: Map<string, Set<string>>; // parentId -> children
  childrenOf: Map<string, Set<string>>; // childId -> parents
  siblings: Map<string, Set<string>>; // по желанию (из brother/sister), не влияет на раскладку
}

interface GraphResult {
  nodes: Map<string, PositionedNode>; // быстрый доступ по id
  edges: Edge[];
  units: FamilyUnit[]; // семейные юниты, удобно для отрисовки «скобками» родителей
  bbox: { minX: number; maxX: number; minY: number; maxY: number }; // габариты сцены
}

// Вспомогательные функции
function ensureMapSet<K, V>(m: Map<K, Set<V>>, k: K): Set<V> {
  let s = m.get(k);
  if (!s) {
    s = new Set<V>();
    m.set(k, s);
  }
  return s;
}

type Scope = 'full' | 'ego';

interface BuildOptions {
  scope?: Scope; // default: 'full'
  includeSpouseParents?: boolean; // для scope='ego', default: false
}

function ensureMapArray<K, V>(m: Map<K, V[]>, k: K): V[] {
  let arr = m.get(k);
  if (!arr) {
    arr = [];
    m.set(k, arr);
  }
  return arr;
}

function addBidirectional(a: Map<string, Set<string>>, x: string, y: string) {
  if (x === y) return;
  ensureMapSet(a, x).add(y);
  ensureMapSet(a, y).add(x);
}

// ⚠️ теперь нормализация знает о людях (нужны даты рождения)
function normalizeRelations(relations: Relation[], persons: Person[]): NormalizedRelations {
  const personById = new Map(persons.map((p) => [p.id, p] as const));
  const getBirth = (id: string) => {
    const d = personById.get(id)?.birthDate;
    return d ? Date.parse(d) : undefined;
  };

  const olderIsParent = (a: string, b: string) => {
    const ta = getBirth(a);
    const tb = getBirth(b);
    if (ta != null && tb != null) {
      if (ta < tb) return { parent: a, child: b };
      if (tb < ta) return { parent: b, child: a };
    }
    // Fallback: кто «более родительский» по типу связи определим ниже
    return null;
  };

  const spouses = new Map<string, Set<string>>();
  const parentsOf = new Map<string, Set<string>>(); // parent -> children
  const childrenOf = new Map<string, Set<string>>(); // child -> parents
  const siblings = new Map<string, Set<string>>();

  const ensure = <K, V>(m: Map<K, Set<V>>, k: K) => {
    let s = m.get(k);
    if (!s) {
      s = new Set<V>();
      m.set(k, s);
    }
    return s;
  };
  const addCouple = (a: string, b: string) => {
    if (a === b) return;
    ensure(spouses, a).add(b);
    ensure(spouses, b).add(a);
  };
  const addParentChild = (parent: string, child: string) => {
    if (parent === child) return;
    ensure(parentsOf, parent).add(child);
    ensure(childrenOf, child).add(parent);
  };

  for (const r of relations) {
    const a = r.fromPersonId;
    const b = r.toPersonId;
    switch (r.type) {
      case RelationType.spouse:
        addCouple(a, b);
        break;
      case RelationType.father:
      case RelationType.mother:
        addParentChild(a, b); // явно parent -> child
        break;
      case RelationType.son:
      case RelationType.daughter: {
        // У тебя встречается и parent->child, и child->parent.
        // Пытаемся ориентировать по возрасту (кто старше — родитель).
        const byAge = olderIsParent(a, b);
        if (byAge) {
          addParentChild(byAge.parent, byAge.child);
          break;
        }

        // Fallback: если пол from совпадает с типом (дочь/сын), считаем from — ребёнок.
        const from = personById.get(a);
        if (
          from &&
          ((r.type === RelationType.daughter && from.sex === SexType.female) ||
            (r.type === RelationType.son && from.sex === SexType.male))
        ) {
          addParentChild(b, a); // b — родитель, a — ребёнок
        } else {
          addParentChild(a, b); // иначе считаем как parent->child
        }
        break;
      }
      case RelationType.brother:
      case RelationType.sister:
        if (a !== b) {
          ensure(siblings, a).add(b);
          ensure(siblings, b).add(a);
        }
        break;
    }
  }

  return { spouses, parentsOf, childrenOf, siblings };
}

/** Стабильный id пары супругов */
function coupleId(a: string, b: string): string {
  return `couple:${[a, b].sort().join('|')}`;
}

/** id одиночного родителя */
function singleId(a: string): string {
  return `single:${a}`;
}

@Injectable({
  providedIn: 'root',
})
export class TreeLayoutService {
  private debug = false;
  setDebug(v: boolean) {
    this.debug = v;
  }
  private log(...args: any[]) {
    if (this.debug) console.log('[TreeLayout]', ...args);
  }

  private config: TreeConfig = {
    cardWidth: 200,
    cardHeight: 120,
    horizontalSpacing: 300, // Увеличиваем горизонтальное расстояние
    verticalSpacing: 200,
    spouseSpacing: 40,
    minScale: 0.3,
    maxScale: 2.0,
  };
  // расстояние между центрами соседних карточек на одном уровне
  private get H_STEP(): number {
    return this.config.cardWidth + this.config.horizontalSpacing;
  }

  // расстояние между центрами карточек по вертикали (между уровнями)
  private get V_STEP(): number {
    return this.config.cardHeight + this.config.verticalSpacing;
  }

  // расстояние между центрами супругов
  private get SPOUSE_STEP(): number {
    return this.config.cardWidth + this.config.spouseSpacing;
  }

  private pruneToEgoSubgraph(
    norm: NormalizedRelations,
    rootId: string,
    includeSpouseParents: boolean
  ): Set<string> {
    const keep = new Set<string>();
    const add = (id: string) => keep.add(id);

    // 1) эго
    add(rootId);

    const spouses = Array.from(norm.spouses.get(rootId) ?? []);
    const parents = Array.from(norm.childrenOf.get(rootId) ?? []); // child -> parents
    const children = Array.from(norm.parentsOf.get(rootId) ?? []); // parent -> children
    const siblings = Array.from(norm.siblings.get(rootId) ?? []);

    // 2) прямые связи
    spouses.forEach(add);
    parents.forEach(add);
    children.forEach(add);
    siblings.forEach(add);

    // 3) прямые потомки КАЖДОГО из этих людей
    const direct = new Set([rootId, ...spouses, ...parents, ...children, ...siblings]);
    for (const id of direct) {
      for (const kid of norm.parentsOf.get(id) ?? []) add(kid);
    }

    // 4) Условие: не добавлять родителей супруги (если не просили)
    if (!includeSpouseParents) {
      for (const s of spouses) {
        for (const p of norm.childrenOf.get(s) ?? []) keep.delete(p);
      }
    }

    return keep;
  }

  calculateTreeLayout(
    persons: Person[],
    relations: Relation[],
    currentUserId: string
  ): { treePersons: TreePerson[]; treeRelations: TreeRelation[]; bounds: TreeBounds } {
    // Валидация входных данных
    if (!persons || persons.length === 0) {
      return { treePersons: [], treeRelations: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    if (!relations) {
      relations = [];
    }

    // Находим корневого пользователя
    const rootPerson = persons.find((p) => p.userId === currentUserId);
    if (!rootPerson) {
      console.warn('TreeLayoutService: currentUserId не найден в списке persons');
      return { treePersons: [], treeRelations: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    // Используем новый алгоритм для построения графа
    const graphResult: GraphResult = this.buildGraph(persons, relations, rootPerson.id);

    // Конвертируем результат обратно в формат TreePerson
    const treePersons = this.convertGraphResultToTreePersons(graphResult, persons, currentUserId);
    const treeRelations = this.convertGraphResultToTreeRelations(graphResult, persons);

    // Рассчитываем границы
    const bounds = this.calculateBoundsFromGraphResult(graphResult);

    return { treePersons, treeRelations, bounds };
  }

  /** Главный метод построения графа и координат. */
  private buildGraph(persons: Person[], relations: Relation[], rootId: string): GraphResult {
    const personById = new Map(persons.map((p) => [p.id, p] as const));
    if (!personById.has(rootId)) {
      throw new Error(`Root person '${rootId}' not found`);
    }

    const norm = normalizeRelations(relations, persons);

    // ===== 1) Инициализируем карту узлов без координат =====
    const nodes = new Map<string, PositionedNode>();
    for (const p of persons) {
      nodes.set(p.id, {
        id: p.id,
        x: 0,
        y: 0,
        level: NaN,
        parents: Array.from(norm.childrenOf.get(p.id) ?? []),
        children: Array.from(norm.parentsOf.get(p.id) ?? []),
        spouses: Array.from(norm.spouses.get(p.id) ?? []),
        siblings: Array.from(norm.siblings.get(p.id) ?? []),
      });
    }

    // ===== 2) Строим семейные юниты относительно root =====
    // Определим уровни (0 = root, >0 вниз к детям, <0 вверх к предкам) BFS-ом по род/детям/супругам.
    this.assignLevels(nodes, rootId);
    this.log(
      'Levels assigned',
      Array.from(nodes.values()).map((n) => ({ id: n.id, level: n.level }))
    );

    // Сгруппируем в юниты_level: Map<level, FamilyUnit[]>
    const unitsByLevel = this.buildFamilyUnitsByLevel(nodes, norm);

    // ===== 3) Раскладка =====
    // 3.1 Уровень 0: корень и его супруг(а), если есть.
    this.layoutLevelZero(unitsByLevel, rootId);

    // 3.2 Потомки: уровни 1..max
    const maxDown = Math.max(0, ...Array.from(unitsByLevel.keys()).filter((l) => l > 0));
    for (let lvl = 1; lvl <= maxDown; lvl++) {
      this.layoutDescendantsLevel(unitsByLevel, lvl, nodes);
    }

    // 3.3 Предки: уровни -1..min
    const maxUp = Math.min(0, ...Array.from(unitsByLevel.keys()).filter((l) => l < 0));
    for (let lvl = -1; lvl >= maxUp; lvl--) {
      this.layoutAncestorsLevel(unitsByLevel, lvl, nodes);
    }

    // ===== 4) Расставим координаты персон на основании координат юнитов =====
    this.materializePersonPositionsFromUnits(unitsByLevel, nodes);
    this.log(
      'Materialized positions',
      Array.from(nodes.values()).map((n) => ({ id: n.id, x: n.x, y: n.y, level: n.level }))
    );
    this.recenterOnRoot(nodes, rootId);

    // ===== 5) Сгенерируем рёбра для отрисовки =====
    const edges: Edge[] = this.buildEdges(nodes, norm);

    // ===== 6) bbox =====
    const bbox = this.computeBBox(nodes);
    this.log('BBox', bbox);

    // Собираем список юнитов одной плоской коллекцией (для удобной отрисовки «скобок»)
    const units: FamilyUnit[] = [];
    for (const [, arr] of Array.from(unitsByLevel.entries()).sort((a, b) => a[0] - b[0])) {
      units.push(...arr);
    }

    return { nodes, edges, units, bbox };
  }

  // --- Вспомогательные методы ---

  private assignLevels(nodes: Map<string, PositionedNode>, rootId: string) {
    const q: string[] = [rootId];
    nodes.get(rootId)!.level = 0;

    while (q.length) {
      const v = q.shift()!;
      const nv = nodes.get(v)!;

      // супруг(а) — тот же уровень
      for (const s of nv.spouses) {
        const ns = nodes.get(s)!;
        if (Number.isNaN(ns.level)) {
          ns.level = nv.level;
          q.push(s);
        }
      }
      // дети — ниже
      for (const c of nv.children) {
        const nc = nodes.get(c)!;
        if (Number.isNaN(nc.level)) {
          nc.level = nv.level + 1;
          q.push(c);
        }
      }
      // родители — выше
      for (const p of nv.parents) {
        const np = nodes.get(p)!;
        if (Number.isNaN(np.level)) {
          np.level = nv.level - 1;
          q.push(p);
        }
      }
      // сиблинги — тот же уровень (нужно, чтобы Алёна встала на 0 с тобой)
      for (const sib of nv.siblings ?? []) {
        const ns = nodes.get(sib)!;
        if (Number.isNaN(ns.level)) {
          ns.level = nv.level;
          q.push(sib);
        }
      }
    }
  }

  private buildFamilyUnitsByLevel(
    nodes: Map<string, PositionedNode>,
    norm: NormalizedRelations
  ): Map<number, FamilyUnit[]> {
    const usedInCouple = new Set<string>();
    const unitsByLevel = new Map<number, FamilyUnit[]>();

    // 1) пары супругов
    for (const [a, spousesOfA] of norm.spouses.entries()) {
      for (const b of spousesOfA) {
        if (a >= b) continue; // чтобы не дублировать пару (a,b) и (b,a)
        const la = nodes.get(a)?.level ?? 0;
        const lb = nodes.get(b)?.level ?? 0;
        const lvl = Number.isFinite(la) && Number.isFinite(lb) ? Math.round((la + lb) / 2) : 0;
        const id = coupleId(a, b);
        const u: FamilyUnit = { id, partners: [a, b], children: [], level: lvl, cx: 0 };
        ensureMapArray(unitsByLevel, lvl).push(u);
        usedInCouple.add(a);
        usedInCouple.add(b);
      }
    }

    // 2) одиночки (кто не в паре) — но только те, кто кому-то родитель/ребёнок (чтобы не мусорить единичными
    // не связанными на уровне)
    for (const [id, node] of nodes) {
      if (usedInCouple.has(id)) continue;
      const hasFamilyEdges = node.parents.length || node.children.length || node.spouses.length;
      if (!hasFamilyEdges) continue;
      const lvl = Number.isFinite(node.level) ? node.level : 0;
      const u: FamilyUnit = { id: singleId(id), partners: [id], children: [], level: lvl, cx: 0 };
      ensureMapArray(unitsByLevel, lvl).push(u);
    }

    // 3) прикрепим детей к юнитам-родителям
    const unitByPartner = new Map<string, FamilyUnit>();
    for (const [, units] of unitsByLevel) {
      for (const u of units) {
        for (const p of u.partners) unitByPartner.set(p, u);
      }
    }

    for (const [parentId, kids] of norm.parentsOf.entries()) {
      const u = unitByPartner.get(parentId);
      if (!u) continue; // parent может быть вне зоны интереса
      for (const k of kids) {
        if (!u.children.includes(k)) u.children.push(k);
      }
    }

    return unitsByLevel;
  }

  private layoutLevelZero(unitsByLevel: Map<number, FamilyUnit[]>, rootId: string) {
    const units0 = unitsByLevel.get(0) ?? [];
    // Найдём юнит с rootId
    const rootUnit = units0.find((u) => u.partners.includes(rootId));
    if (!rootUnit) return;

    // Центрируем корневой юнит по X = 0
    rootUnit.cx = 0;

    // Если пара — разъединим внутри юнита позже (при materializePersonPositionsFromUnits), здесь важен только cx
    // Остальные юниты уровня 0 (например, сиблинги-супруги) разложим вправо и влево
    const others = units0.filter((u) => u !== rootUnit);
    let left = -this.H_STEP;
    let right = this.H_STEP;
    let dir = 1;
    for (const u of others) {
      if (dir > 0) {
        u.cx = right;
        right += this.H_STEP;
      } else {
        u.cx = left;
        left -= this.H_STEP;
      }
      dir *= -1;
    }
  }

  private layoutDescendantsLevel(
    unitsByLevel: Map<number, FamilyUnit[]>,
    lvl: number,
    nodes: Map<string, PositionedNode>
  ) {
    const units = unitsByLevel.get(lvl) ?? [];
    const parentUnits = unitsByLevel.get(lvl - 1) ?? [];

    // Группируем детей по наборам родителей (юнитам на уровне выше)
    interface Group {
      key: string;
      parents: FamilyUnit[];
      kids: string[];
      cx: number;
    }
    const groups = new Map<string, Group>();

    for (const u of parentUnits) {
      if (!u.children.length) continue;
      // один юнит → одна группа детей
      const key = u.id;
      groups.set(key, {
        key,
        parents: [u],
        kids: [...u.children.filter((k) => nodes.get(k)?.level === lvl)],
        cx: 0,
      });
    }

    // Выставим cx для групп = средний cx родителей
    for (const g of groups.values()) {
      g.cx = g.parents.reduce((s, p) => s + p.cx, 0) / g.parents.length;
    }

    // Сформируем список позиций для детей, равномерно вокруг g.cx
    // И параллельно сдвинем сами юниты уровня lvl под нужные x (их cx = x ребёнка)
    const takenXs: number[] = [];
    const pushWithoutOverlap = (x: number): number => {
      // простая защита от коллизий: если близко к занятым, подвинем к ближайшей свободной точке кратной horizontalSpacing
      let nx = Math.round(x / this.H_STEP) * this.H_STEP;
      const minGap = this.H_STEP * 0.8; // небольшой «зазор», чтобы не слипались
      let guard = 0;
      while (takenXs.some((tx) => Math.abs(tx - nx) < minGap) && guard++ < 1000) {
        nx += this.H_STEP;
      }
      takenXs.push(nx);
      return nx;
    };

    const kidUnitByPerson = new Map<string, FamilyUnit>();
    for (const u of units) for (const p of u.partners) kidUnitByPerson.set(p, u);

    for (const g of Array.from(groups.values()).sort((a, b) => a.cx - b.cx)) {
      const n = g.kids.length;
      if (n === 0) continue;

      if (n === 1) {
        const x = pushWithoutOverlap(g.cx);
        const k = g.kids[0];
        const unit = kidUnitByPerson.get(k);
        if (unit) unit.cx = x; // одиночный ребёнок/пара ребёнка будет центрироваться в materialize
      } else {
        // разместим детей гридом слева-направо вокруг центра
        const half = (n - 1) / 2;
        for (let i = 0; i < n; i++) {
          const targetX = g.cx + (i - half) * this.H_STEP;
          const x = pushWithoutOverlap(targetX);
          const k = g.kids[i];
          const unit = kidUnitByPerson.get(k);
          if (unit) unit.cx = x;
        }
      }
    }
  }

  private layoutAncestorsLevel(
    unitsByLevel: Map<number, FamilyUnit[]>,
    lvl: number,
    nodes: Map<string, PositionedNode>
  ) {
    // Аналогично потомкам, но наверх. Берём «детские» юниты уровня lvl+1 и центрируем родителей над ними.
    const units = unitsByLevel.get(lvl) ?? [];
    const childUnits = unitsByLevel.get(lvl + 1) ?? [];

    // От ребёнка к его родительским юнитам
    interface Group {
      key: string;
      children: FamilyUnit[];
      parents: FamilyUnit[];
      cx: number;
    }
    const groups = new Map<string, Group>();

    // Обратные ссылки: person -> unit на текущем уровне
    const unitByPartner = new Map<string, FamilyUnit>();
    for (const u of units) for (const p of u.partners) unitByPartner.set(p, u);

    for (const cu of childUnits) {
      // Родители каждого партнёра ребёнка
      const parentUnits = new Set<FamilyUnit>();
      for (const kidId of cu.partners) {
        const parents = nodes.get(kidId)?.parents ?? [];
        for (const p of parents) {
          const pu = unitByPartner.get(p);
          if (pu) parentUnits.add(pu);
        }
      }
      if (parentUnits.size === 0) continue;
      const key = Array.from(parentUnits)
        .map((u) => u.id)
        .sort()
        .join('|');
      const g = groups.get(key) ?? { key, children: [], parents: Array.from(parentUnits), cx: 0 };
      g.children.push(cu);
      groups.set(key, g);
    }

    for (const g of groups.values()) {
      // центр — средний cx детей
      g.cx = g.children.reduce((s, c) => s + c.cx, 0) / g.children.length;
      // выставим одинаковый cx для всех родительских юнитов в группе
      for (const p of g.parents) p.cx = g.cx;
    }

    // Лёгкая развязка коллизий по уровню
    const levelUnits = unitsByLevel.get(lvl) ?? [];
    levelUnits.sort((a, b) => a.cx - b.cx);
    for (let i = 1; i < levelUnits.length; i++) {
      const prev = levelUnits[i - 1];
      const cur = levelUnits[i];
      if (cur.cx - prev.cx < this.H_STEP) {
        cur.cx = prev.cx + this.H_STEP;
      }
    }
  }

  private materializePersonPositionsFromUnits(
    unitsByLevel: Map<number, FamilyUnit[]>,
    nodes: Map<string, PositionedNode>
  ) {
    const levels = Array.from(unitsByLevel.keys());
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    for (let lvl = minLevel; lvl <= maxLevel; lvl++) {
      const units = (unitsByLevel.get(lvl) ?? []).sort((a, b) => a.cx - b.cx);
      const y = lvl * this.V_STEP;

      for (const u of units) {
        if (u.partners.length === 2) {
          const [a, b] = u.partners;
          const ax = u.cx - this.SPOUSE_STEP / 2;
          const bx = u.cx + this.SPOUSE_STEP / 2;
          const na = nodes.get(a)!;
          na.x = ax;
          na.y = y;
          na.level = lvl;
          const nb = nodes.get(b)!;
          nb.x = bx;
          nb.y = y;
          nb.level = lvl;
        } else {
          const a = u.partners[0];
          const na = nodes.get(a)!;
          na.x = u.cx;
          na.y = y;
          na.level = lvl;
        }
      }
    }
  }

  private recenterOnRoot(nodes: Map<string, PositionedNode>, rootId: string) {
    const root = nodes.get(rootId);
    if (!root) return;
    const dx = -root.x;
    const dy = -root.y;
    for (const n of nodes.values()) {
      n.x += dx;
      n.y += dy;
    }
  }
  private buildEdges(nodes: Map<string, PositionedNode>, norm: NormalizedRelations): Edge[] {
    const edges: Edge[] = [];
    // Spouse edges: одно ребро между супругами
    for (const [a, sps] of norm.spouses.entries()) {
      for (const b of sps) {
        if (a < b) edges.push({ from: a, to: b, kind: 'spouse' });
      }
    }
    // Parent edges: parent -> child
    for (const [p, kids] of norm.parentsOf.entries()) {
      for (const k of kids) edges.push({ from: p, to: k, kind: 'parent' });
    }
    // Sibling edges (необязательно отрисовывать)
    for (const [a, sibs] of norm.siblings.entries()) {
      for (const b of sibs) if (a < b) edges.push({ from: a, to: b, kind: 'sibling' });
    }
    return edges;
  }

  private computeBBox(nodes: Map<string, PositionedNode>) {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of nodes.values()) {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    }
    return { minX, maxX, minY, maxY };
  }

  private convertGraphResultToTreePersons(
    graphResult: GraphResult,
    persons: Person[],
    currentUserId: string
  ): TreePerson[] {
    const personMap = new Map(persons.map((p) => [p.id, p]));

    return Array.from(graphResult.nodes.values())
      .sort((a, b) => a.level - b.level || a.x - b.x)
      .map((node) => {
        const person = personMap.get(node.id);
        if (!person) {
          throw new Error(`Person with id ${node.id} not found`);
        }

        return {
          ...person,
          x: node.x,
          y: node.y,
          level: node.level,
          isCurrentUser: person.userId === currentUserId,
        };
      });
  }

  private convertGraphResultToTreeRelations(
    graphResult: GraphResult,
    persons: Person[]
  ): TreeRelation[] {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const nodeMap = graphResult.nodes;

    return graphResult.edges
      .map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);

        if (!fromNode || !toNode) {
          return null;
        }

        const fromPerson = personMap.get(edge.from);
        const toPerson = personMap.get(edge.to);

        if (!fromPerson || !toPerson) {
          return null;
        }

        // Конвертируем тип связи из нового формата в старый
        let relationType: RelationType;
        switch (edge.kind) {
          case 'spouse':
            relationType = RelationType.spouse;
            break;
          case 'parent':
            // Определяем, кто родитель, а кто ребенок
            if (fromNode.level < toNode.level) {
              relationType = toPerson.sex === 'female' ? RelationType.mother : RelationType.father;
            } else {
              relationType = toPerson.sex === 'male' ? RelationType.son : RelationType.daughter;
            }
            break;
          case 'sibling':
            relationType = toPerson.sex === 'male' ? RelationType.brother : RelationType.sister;
            break;
          default:
            relationType = RelationType.spouse; // fallback
        }

        return {
          from: {
            ...fromPerson,
            x: fromNode.x,
            y: fromNode.y,
            level: fromNode.level,
            isCurrentUser: false,
          },
          to: {
            ...toPerson,
            x: toNode.x,
            y: toNode.y,
            level: toNode.level,
            isCurrentUser: false,
          },
          type: relationType,
        };
      })
      .filter(Boolean) as TreeRelation[];
  }

  private calculateBoundsFromGraphResult(graphResult: GraphResult): TreeBounds {
    const { bbox } = graphResult;

    // Добавляем отступы для карточек
    const cardPadding = this.config.cardWidth / 2;
    const cardHeightPadding = this.config.cardHeight / 2;

    return {
      minX: bbox.minX - cardPadding,
      maxX: bbox.maxX + cardPadding,
      minY: bbox.minY - cardHeightPadding,
      maxY: bbox.maxY + cardHeightPadding,
    };
  }

  getConfig(): TreeConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<TreeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
