import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import { Person, Relation } from '../../../core/api/domain/entities';
import { TreePerson, TreeRelation, TreeBounds } from '../../interfaces/tree.interface';
import { TreeLayoutService } from '../../services/tree-layout.service';
import { ViewportHeightService } from '../../services/viewport-height.service';
import { PersonCardComponent } from '../person-card/person-card.component';
import { TreeControlsComponent } from './tree-controls/tree-controls.component';

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [CommonModule, PersonCardComponent, TreeControlsComponent],
  styleUrls: ['./family-tree.component.scss'],
  template: `
    <div
      class="tree-container"
      [class.dragging]="isDragging"
      [style.--tree-container-height]="viewportHeight.getContentHeightCss()"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp($event)"
      (mouseleave)="onMouseUp($event)"
      (wheel)="onWheel($event)"
    >
      <!-- SVG для линий -->
      <svg #treeSvg class="tree-svg" [attr.width]="svgWidth" [attr.height]="svgHeight">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary, #666)" />
          </marker>
        </defs>

        <!-- Линии связей -->
        <g *ngFor="let relation of getFilteredRelations()">
          <path
            [attr.d]="getConnectionPath(relation)"
            stroke="var(--text-secondary, #666)"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />
        </g>
      </svg>

      <!-- Контент дерева -->
      <div #treeContent class="tree-content" [style.transform]="getTransform()">
        <app-person-card *ngFor="let person of treePersons" [person]="person"></app-person-card>
      </div>

      <!-- Элементы управления -->
      <app-tree-controls
        [scale]="scale"
        [minScale]="minScale"
        [maxScale]="maxScale"
        (zoomIn)="zoomIn()"
        (zoomOut)="zoomOut()"
        (resetView)="resetView()"
      ></app-tree-controls>
    </div>
  `,
})
export class FamilyTreeComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() persons: Person[] = [];
  @Input() relations: Relation[] = [];
  @Input() currentUserId: string = '';

  @ViewChild('treeSvg') treeSvg!: ElementRef<SVGElement>;
  @ViewChild('treeContent') treeContent!: ElementRef<HTMLDivElement>;

  treePersons: TreePerson[] = [];
  treeRelations: TreeRelation[] = [];
  bounds: TreeBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  // Параметры масштабирования и перетаскивания
  scale = 1;
  minScale = 0.3;
  maxScale = 2.0;
  translateX = 0;
  translateY = 0;

  // Состояние перетаскивания
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // Размеры SVG
  svgWidth = window.innerWidth || 1200;
  svgHeight = window.innerHeight || 800;

  // Сервис для работы с высотой viewport
  viewportHeight = inject(ViewportHeightService);
  private cdr = inject(ChangeDetectorRef);

  constructor(private treeLayoutService: TreeLayoutService) {
    // Обновляем высоту при изменении размеров
    effect(() => {
      setTimeout(() => {
        this.updateSvgSize();
        this.centerTree();
        this.cdr.detectChanges();
      });
    });
  }

  ngOnInit(): void {
    this.calculateTreeLayout();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Пересчитываем дерево при изменении входных данных
    if (changes['persons'] || changes['relations'] || changes['currentUserId']) {
      this.calculateTreeLayout();
      // Центрируем дерево после пересчета
      setTimeout(() => {
        this.centerTree();
        this.cdr.detectChanges();
      });
    }
  }

  ngAfterViewInit(): void {
    // Обновляем высоты после инициализации view
    this.viewportHeight.refreshHeights();
    setTimeout(() => {
      this.updateSvgSize();
      this.centerTree();
      this.cdr.detectChanges();
    });

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy(): void {
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    setTimeout(() => {
      this.updateSvgSize();
      this.centerTree();
      this.cdr.detectChanges();
    });
  }

  private calculateTreeLayout(): void {
    // Валидация входных данных
    if (!this.persons || this.persons.length === 0) {
      this.treePersons = [];
      this.treeRelations = [];
      this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      return;
    }

    if (!this.relations) {
      this.relations = [];
    }

    if (!this.currentUserId) {
      console.warn('FamilyTreeComponent: currentUserId не задан');
    }

    const result = this.treeLayoutService.calculateTreeLayout(
      this.persons,
      this.relations,
      this.currentUserId
    );

    this.treePersons = result.treePersons;
    this.treeRelations = result.treeRelations;
    this.bounds = result.bounds;
  }

  private updateSvgSize(): void {
    if (this.treeContent?.nativeElement) {
      const newWidth = window.innerWidth;
      const newHeight = this.viewportHeight.contentHeight();

      // Обновляем только если значения изменились
      if (this.svgWidth !== newWidth || this.svgHeight !== newHeight) {
        this.svgWidth = newWidth;
        this.svgHeight = newHeight;

        // Принудительно обновляем view для корректного отображения
        this.cdr.detectChanges();
      }
    }
  }

  private centerTree(): void {
    if (this.bounds.minX === this.bounds.maxX && this.bounds.minY === this.bounds.maxY) {
      return;
    }

    const centerX = (this.bounds.minX + this.bounds.maxX) / 2;
    const centerY = (this.bounds.minY + this.bounds.maxY) / 2;

    this.translateX = window.innerWidth / 2 - centerX;
    this.translateY = this.viewportHeight.contentHeight() / 2 - centerY;
  }

  getTransform(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  getFilteredRelations(): TreeRelation[] {
    const filteredRelations: TreeRelation[] = [];
    const processedChildren = new Set<string>();

    for (const relation of this.treeRelations) {
      // Для связей супругов - показываем все
      if (relation.type === 'spouse') {
        filteredRelations.push(relation);
      }
      // Для связей к родителям - показываем все
      else if (relation.type === 'father' || relation.type === 'mother') {
        filteredRelations.push(relation);
      }
      // Для связей к детям - показываем только одну линию от центра родителей
      else if (relation.type === 'son' || relation.type === 'daughter') {
        if (!processedChildren.has(relation.to.id)) {
          // Создаем виртуальную связь от центра родителей к ребенку
          const virtualRelation: TreeRelation = {
            from: this.createVirtualParentCenter(relation.to),
            to: relation.to,
            type: relation.type,
          };
          filteredRelations.push(virtualRelation);
          processedChildren.add(relation.to.id);
        }
      }
      // Для других типов связей - показываем все
      else {
        filteredRelations.push(relation);
      }
    }

    return filteredRelations;
  }

  private createVirtualParentCenter(child: TreePerson): TreePerson {
    const parents = this.treeRelations
      .filter((rel) => rel.to.id === child.id && (rel.type === 'father' || rel.type === 'mother'))
      .map((rel) => rel.from);

    if (parents.length === 0) {
      return child; // Если родителей нет, возвращаем самого ребенка
    }

    if (parents.length === 1) {
      return parents[0]; // Если один родитель, возвращаем его
    }

    // Если два родителя, создаем виртуальную точку в центре между ними
    const centerX = (parents[0].x + parents[1].x) / 2;
    const centerY = parents[0].y; // Родители на одном уровне

    return {
      ...parents[0], // Копируем все свойства первого родителя
      id: `virtual-center-${child.id}`,
      x: centerX,
      y: centerY,
      firstName: '',
      lastName: '',
      middleName: '',
      birthDate: null,
      deathDate: null,
      birthPlace: null,
      residencePlace: null,
      sex: 'male' as any,
      description: null,
      user: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
      userId: '',
      level: parents[0].level,
      isCurrentUser: false,
    };
  }

  getConnectionPath(relation: TreeRelation): string {
    // Получаем размеры карточки из конфигурации
    const cardWidth = 200;
    const cardHeight = 120;

    // Рассчитываем позиции с учетом трансформаций дерева
    const fromX = (relation.from.x + cardWidth / 2) * this.scale + this.translateX;
    const fromY = (relation.from.y + cardHeight / 2) * this.scale + this.translateY;
    const toX = (relation.to.x + cardWidth / 2) * this.scale + this.translateX;
    const toY = (relation.to.y + cardHeight / 2) * this.scale + this.translateY;

    // Для супругов - прямая горизонтальная линия
    if (relation.type === 'spouse') {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // Для связей к родителям - прямая линия вверх
    if (relation.type === 'father' || relation.type === 'mother') {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
    // Для связей к детям - кривая линия вниз
    else if (relation.type === 'son' || relation.type === 'daughter') {
      const controlOffset = Math.abs(toY - fromY) * 0.3;
      return `M ${fromX} ${fromY} Q ${fromX} ${fromY + controlOffset} ${toX} ${toY}`;
    }
    // Для других типов связей - прямая линия
    else {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
  }

  // Обработчики мыши
  onMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;

      this.translateX += deltaX;
      this.translateY += deltaY;

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;

      // Принудительно обновляем view для перерисовки линий
      this.cdr.detectChanges();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
  }

  // Обработчик колесика мыши
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

    if (newScale !== this.scale) {
      // Масштабирование относительно позиции мыши
      const rect = this.treeContent.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const scaleFactor = newScale / this.scale;

      this.translateX = mouseX - (mouseX - this.translateX) * scaleFactor;
      this.translateY = mouseY - (mouseY - this.translateY) * scaleFactor;

      this.scale = newScale;

      // Принудительно обновляем view для перерисовки линий
      this.cdr.detectChanges();
    }
  }

  // Методы управления масштабом
  zoomIn(): void {
    if (this.scale < this.maxScale) {
      this.scale = Math.min(this.maxScale, this.scale + 0.2);
      this.cdr.detectChanges();
    }
  }

  zoomOut(): void {
    if (this.scale > this.minScale) {
      this.scale = Math.max(this.minScale, this.scale - 0.2);
      this.cdr.detectChanges();
    }
  }

  resetView(): void {
    this.scale = 1;
    this.centerTree();
    this.cdr.detectChanges();
  }
}
