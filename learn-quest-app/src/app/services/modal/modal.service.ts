import {ApplicationRef, createComponent, EnvironmentInjector, Injectable, Type} from '@angular/core';
import {ModalHostComponent} from '../../components/modal/modal-host/modal-host.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private appRef: ApplicationRef, private env: EnvironmentInjector) {}

  open<T, R = any>(content: Type<T>, input?: Partial<T>): Promise<R | null> {
    const hostRef = createComponent(ModalHostComponent, { environmentInjector: this.env });
    this.appRef.attachView(hostRef.hostView);
    document.body.appendChild(hostRef.location.nativeElement);

    // content component in de modal host plaatsen
    const contentRef = hostRef.instance.attach(content);
    Object.assign(contentRef.instance as Partial<T>, input || {});
    hostRef.instance.open();

    return new Promise<R | null>(resolve => {
      hostRef.instance.closed.subscribe((result: R | null) => {
        resolve(result);
        hostRef.destroy();
      });
    });
  }
}
