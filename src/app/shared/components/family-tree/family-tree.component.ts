import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
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

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [CommonModule, PersonCardComponent],
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
        <g *ngFor="let relation of treeRelations">
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
      <div class="tree-controls">
        <button
          class="control-button"
          (click)="zoomIn()"
          [disabled]="scale >= maxScale"
          title="Увеличить"
        >
          +
        </button>
        <button
          class="control-button"
          (click)="zoomOut()"
          [disabled]="scale <= minScale"
          title="Уменьшить"
        >
          −
        </button>
        <button class="control-button" (click)="resetView()" title="Сбросить вид">⌂</button>
      </div>

      <!-- Информация о масштабе -->
      <div class="zoom-info">Масштаб: {{ scale * 100 | number : '1.0-0' }}%</div>
    </div>
  `,
})
export class FamilyTreeComponent implements OnInit, AfterViewInit, OnDestroy {
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

  getConnectionPath(relation: TreeRelation): string {
    const fromX = relation.from.x + 100; // Центр карточки
    const fromY = relation.from.y + 60;
    const toX = relation.to.x + 100;
    const toY = relation.to.y + 60;

    // Для супругов - прямая горизонтальная линия
    if (relation.type === 'spouse') {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // Для родителей и детей - кривая линия
    const controlY = (fromY + toY) / 2;
    const controlOffset = Math.abs(toY - fromY) * 0.3;

    if (relation.type === 'father' || relation.type === 'mother') {
      // Линия к родителям (вверх)
      return `M ${fromX} ${fromY} Q ${fromX} ${fromY - controlOffset} ${toX} ${toY}`;
    } else if (relation.type === 'son' || relation.type === 'daughter') {
      // Линия к детям (вниз)
      return `M ${fromX} ${fromY} Q ${fromX} ${fromY + controlOffset} ${toX} ${toY}`;
    } else {
      // Для других типов связей - прямая линия
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
    }
  }

  // Методы управления масштабом
  zoomIn(): void {
    if (this.scale < this.maxScale) {
      this.scale = Math.min(this.maxScale, this.scale + 0.2);
    }
  }

  zoomOut(): void {
    if (this.scale > this.minScale) {
      this.scale = Math.max(this.minScale, this.scale - 0.2);
    }
  }

  resetView(): void {
    this.scale = 1;
    this.centerTree();
  }
}
