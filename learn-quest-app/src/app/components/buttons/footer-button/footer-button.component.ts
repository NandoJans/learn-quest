import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone,
  OnDestroy, Output, ViewChild, ChangeDetectionStrategy
} from '@angular/core';
import {NgClass} from '@angular/common';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-footer-button',
  templateUrl: './footer-button.component.html',
  styleUrl: './footer-button.component.css',
  imports: [
    NgClass,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterButtonComponent implements AfterViewInit, OnDestroy {
  @Input() text: string = 'Submit';
  @Input() icon: IconDefinition | null | undefined = null;
  @Input() btnClass: string = 'btn-primary';
  @Input() disabled = false;
  @Output() click = new EventEmitter<any>();

  @ViewChild('wrap', { static: true }) wrapRef!: ElementRef<HTMLElement>;

  private raf = 0;
  private edgeFalloffPx = 140;
  private onMove!: (e: PointerEvent) => void;
  private onLeave!: () => void;

  constructor(private ngZone: NgZone) {}

  emit(e?: any) {
    if (!this.disabled) this.click.emit(e);
  }

  ngAfterViewInit(): void {
    const el = this.wrapRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      this.onMove = (e: PointerEvent) => {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          el.style.setProperty('--glow-x', `${x}px`);
          el.style.setProperty('--glow-y', `${y}px`);

          const top = y;
          const bottom = rect.height - y;
          const left = x;
          const right = rect.width - x;

          el.style.setProperty('--g-top',    this.weight(top).toString());
          el.style.setProperty('--g-right',  this.weight(right).toString());
          el.style.setProperty('--g-bottom', this.weight(bottom).toString());
          el.style.setProperty('--g-left',   this.weight(left).toString());
        });
      };

      this.onLeave = () => {
        el.style.setProperty('--g-top', '0');
        el.style.setProperty('--g-right', '0');
        el.style.setProperty('--g-bottom', '0');
        el.style.setProperty('--g-left', '0');
      };

      el.addEventListener('pointermove', this.onMove, { passive: true });
      el.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const el = this.wrapRef?.nativeElement;
    if (el && this.onMove && this.onLeave) {
      el.removeEventListener('pointermove', this.onMove);
      el.removeEventListener('pointerleave', this.onLeave);
    }
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  private weight(d: number) {
    const r = Math.max(0, 1 - d / this.edgeFalloffPx);
    return +(r * r).toFixed(3);
  }
}
