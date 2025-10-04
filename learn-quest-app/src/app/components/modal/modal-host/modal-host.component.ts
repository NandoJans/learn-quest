import {
  Component,
  ComponentRef,
  EventEmitter,
  HostListener,
  Output,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'app-modal-host',
  imports: [],
  templateUrl: './modal-host.component.html',
  styleUrl: './modal-host.component.css'
})
export class ModalHostComponent {
  @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
  @Output() closed = new EventEmitter<any>();
  private contentRef?: ComponentRef<any>;

  attach<T>(cmp: Type<T>): ComponentRef<T> {
    this.vc.clear();
    this.contentRef = this.vc.createComponent(cmp);
    // geef de host close-fn door
    (this.contentRef.instance as any).close = (res?: any) => this.close(res ?? null);
    return this.contentRef as ComponentRef<T>;
  }

  open() {
  }

  close(result: any) {
    this.closed.emit(result);
  }

  @HostListener('document:keydown.escape') esc() {
    this.close(null);
  }
}
