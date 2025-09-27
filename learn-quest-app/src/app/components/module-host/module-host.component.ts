import {
  Component,
  ComponentRef,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges, Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ModuleRegistryService} from '../../services/module/module-registry.service';
import {InteractiveModule} from '../../contract/interactive-module';

@Component({
  selector: 'app-module-host',
  imports: [],
  templateUrl: './module-host.component.html',
  styleUrl: './module-host.component.css'
})
export class ModuleHostComponent {
  @Input() slug!: string;
  @Input() config: any = {};
  /** Bubble module-originated config updates up if you want (optional) */
  @Output() configChange = new EventEmitter<any>();

  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;

  private registry = inject(ModuleRegistryService);
  private cmpRef?: ComponentRef<any>;

  async ngOnChanges(ch: SimpleChanges) {
    if (ch['slug']) await this.load();
    if (this.cmpRef && ch['config']) this.applyConfig(this.config);
  }

  private async load() {
    this.vc.clear();
    if (!this.slug) return;
    const def = this.registry.getBySlug(this.slug);
    if (!def) return;
    const Cmp: Type<any> = await def.loader();
    this.cmpRef = this.vc.createComponent(Cmp);
    this.applyConfig(this.config);

    const inst = this.cmpRef.instance as InteractiveModule;
    // If the module emits config changes (optional), bubble them
    if (inst?.configChange?.subscribe) {
      inst.configChange.subscribe(v => this.configChange.emit(v));
    }
  }

  private applyConfig(cfg: any) {
    if (!this.cmpRef) return;
    const inst = this.cmpRef.instance as InteractiveModule;
    (this.cmpRef as any).setInput?.('config', cfg) ?? (inst.config = cfg);
  }
}
