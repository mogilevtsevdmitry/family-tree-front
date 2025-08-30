import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  inject,
} from '@angular/core';

type BoolLike = boolean | '' | 'true' | 'false' | 0 | 1 | '0' | '1';
function asBool(v: BoolLike | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (v === '') return true;
  const s = String(v).toLowerCase();
  return s === 'true' || s === '1';
}

@Directive({
  selector: '[appLiquidGlass]',
  standalone: true,
})
export class LiquidGlassDirective implements OnInit, OnChanges, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly r = inject(Renderer2);

  /** Включить/выключить эффект (по умолчанию true) */
  @Input('appLiquidGlass') enabled: BoolLike | undefined;

  /** Параметры: можно задавать как строку (px/число), так и number */
  @Input() lgBlur?: string | number; // default 18px
  @Input() lgSaturation?: string | number; // default 1.4
  @Input() lgBorder?: string | number; // alpha 0..1 (default 1)
  @Input() lgAnimate?: BoolLike; // default true

  private appliedClass = false;

  ngOnInit(): void {
    this.applyAll();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.applyAll();
  }

  ngOnDestroy(): void {
    if (this.appliedClass) {
      this.r.removeClass(this.el.nativeElement, 'liquid-glass');
    }
    // очистим CSS-переменные
    this.setVar('--lg-blur', null);
    this.setVar('--lg-saturate', null);
    this.setVar('--lg-border-alpha', null);
    this.setVar('--lg-animate', null);
  }

  // === internals ===
  private applyAll(): void {
    const host = this.el.nativeElement;
    const on = asBool(this.enabled, true);

    if (on && !this.appliedClass) {
      this.r.addClass(host, 'liquid-glass');
      this.appliedClass = true;
    } else if (!on && this.appliedClass) {
      this.r.removeClass(host, 'liquid-glass');
      this.appliedClass = false;
    }

    // параметры (если не заданы — оставляем значения по умолчанию из токенов)
    const blur = this.normalizeCss(this.lgBlur, 'px', 18);
    const sat = this.normalizeCss(this.lgSaturation, '', 1.4);
    const brd = this.normalizeCss(this.lgBorder, '', 1); // alpha 0..1
    const anim = asBool(this.lgAnimate, true) ? 1 : 0;

    this.setVar('--lg-blur', blur);
    this.setVar('--lg-saturate', sat);
    this.setVar('--lg-border-alpha', brd);
    this.setVar('--lg-animate', String(anim));
  }

  private setVar(name: string, value: string | null) {
    if (value === null) {
      this.r.removeStyle(this.el.nativeElement, name);
    } else {
      this.r.setStyle(this.el.nativeElement, name, value);
    }
  }

  private normalizeCss(v: string | number | undefined, unit: string, def: number): string {
    if (v === undefined || v === null || v === '') return unit ? `${def}${unit}` : String(def);
    if (typeof v === 'number') return unit ? `${v}${unit}` : String(v);
    // строка — если уже содержит ед.изм., оставляем как есть
    if (unit && /\d$/.test(v.trim())) return `${v}${unit}`;
    return v;
  }
}
