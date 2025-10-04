import {Component, computed, inject, signal} from '@angular/core';
import {ModuleDefinition} from '../../../interfaces/interactive/module-meta';
import {ModuleRegistryService} from '../../../services/module/module-registry.service';
import {ModuleConfigService} from '../../../services/module/module-config.service';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {ModuleHostComponent} from '../../../components/module-host/module-host.component';
import {ModuleConfigFormComponent} from '../../../components/module-config-form/module-config-form.component';

@Component({
  selector: 'app-interactive-module-library',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    ModuleHostComponent,
    ModuleConfigFormComponent
  ],
  templateUrl: './interactive-module-library.component.html',
  styleUrl: './interactive-module-library.component.css'
})
export class InteractiveModuleLibraryComponent {
  private registry = inject(ModuleRegistryService);
  private cfg = inject(ModuleConfigService);
  private fb = inject(FormBuilder);

  // UI state
  search = this.fb.control<string>('');
  selectedSlug = signal<string | null>(null);
  selected = computed(() => this.list().find(m => m.slug === this.selectedSlug()) || null);

  // List modules
  list = signal<ModuleDefinition[]>(this.registry.list());
  filtered = computed(() => {
    const q = (this.search.value ?? '').toLowerCase();
    if (!q) return this.list();
    return this.list().filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => t.toLowerCase().includes(q)));
  });

  // Config state
  private _config = signal<any>({});
  config = computed(() => this._config());

  async select(m: ModuleDefinition) {
    this.selectedSlug.set(m.slug);
    // Get defaults from backend or use empty object
    const defaults = await this.cfg.getConfigForSlug(m.slug).toPromise().catch(() => ({}));
    this._config.set(defaults || {});
  }

  onConfigChange(newConfig: any) {
    this._config.set(newConfig);
  }

  confirm() {
    if (!this.selected()) return;
    (this as any).close?.({
      slug: this.selected()!.slug,
      config: this.config()
    });
  }

  track(_: number, m: ModuleDefinition) {
    return m.slug;
  }
}
