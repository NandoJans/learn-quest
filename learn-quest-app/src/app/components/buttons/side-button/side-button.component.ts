import {
  AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild,
  EventEmitter, Input, Output, ChangeDetectionStrategy, Renderer2
} from '@angular/core';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import {NgClass, NgIf} from '@angular/common';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-button',
  imports: [FaIconComponent, NgIf, NgClass],
  templateUrl: './side-button.component.html',
  styleUrl: './side-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideButtonComponent implements AfterViewInit, OnDestroy {
  @Input() icon: IconDefinition | null | undefined = null;
  @Output() click = new EventEmitter<any>();
  @Input() disabled = false;
  @Input() btnClass = '';
  @Input() text = '';

  @ViewChild('wrap', { static: true }) wrapRef!: ElementRef<HTMLElement>;

  private raf = 0;
  private edgeFalloffPx = 140;
  private onMove!: (e: PointerEvent) => void;
  private onLeave!: () => void;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {}

  emit(event: any) { this.click.emit(event); }
  isIcon(): boolean { return this.icon != null; }
  getIcon(): IconDefinition { return this.icon || faQuestion; }

  ngAfterViewInit(): void {
    const wrap = this.wrapRef.nativeElement;
    const btn = wrap.querySelector('button') as HTMLElement;

    this.ngZone.runOutsideAngular(() => {
      this.onMove = (e: PointerEvent) => {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => {
          const rect = wrap.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          wrap.style.setProperty('--glow-x', `${x}px`);
          wrap.style.setProperty('--glow-y', `${y}px`);

          const top = y, bottom = rect.height - y, left = x, right = rect.width - x;
          wrap.style.setProperty('--g-top',    this.weight(top).toString());
          wrap.style.setProperty('--g-right',  this.weight(right).toString());
          wrap.style.setProperty('--g-bottom', this.weight(bottom).toString());
          wrap.style.setProperty('--g-left',   this.weight(left).toString());
        });
      };

      this.onLeave = () => {
        if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
        // set all values hard to zero
        wrap.style.setProperty('--g-top', '0');
        wrap.style.setProperty('--g-right', '0');
        wrap.style.setProperty('--g-bottom', '0');
        wrap.style.setProperty('--g-left', '0');
        wrap.style.setProperty('--glow-x', `-9999px`);
        wrap.style.setProperty('--glow-y', `-9999px`);
      };

      // luister op wrapper én button
      wrap.addEventListener('pointermove', this.onMove, { passive: true });
      wrap.addEventListener('pointerleave', this.onLeave, { passive: true });
      btn?.addEventListener('pointerleave', this.onLeave, { passive: true });
      // extra vangnet
      wrap.addEventListener('pointercancel', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const wrap = this.wrapRef?.nativeElement;
    const btn = wrap?.querySelector('button') as HTMLElement | null;
    if (wrap && this.onMove && this.onLeave) {
      wrap.removeEventListener('pointermove', this.onMove);
      wrap.removeEventListener('pointerleave', this.onLeave);
      wrap.removeEventListener('pointercancel', this.onLeave);
      btn?.removeEventListener('pointerleave', this.onLeave);
    }
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  private weight(d: number) {
    const r = Math.max(0, 1 - d / this.edgeFalloffPx);
    return +(r * r).toFixed(3);
  }
}
