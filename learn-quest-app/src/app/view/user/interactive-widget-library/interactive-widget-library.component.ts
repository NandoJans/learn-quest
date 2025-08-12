import {Component, computed, inject, signal} from '@angular/core';
import {ModuleRegistryService} from '../../../services/module-registry.service';
import { Router } from '@angular/router';
import {NgForOf} from '@angular/common';
import {RouteService} from '../../../services/route.service';

@Component({
  selector: 'app-interactive-widget-library',
  imports: [
    NgForOf
  ],
  templateUrl: './interactive-widget-library.component.html',
  styleUrl: './interactive-widget-library.component.css'
})
export class InteractiveWidgetLibraryComponent {
  registry = inject(ModuleRegistryService);
  q = signal('');
  modules = this.registry.list();
  filtered = computed(() => {
    const s = this.q().toLowerCase().trim();
    if (!s) return this.modules;
    return this.modules.filter(m =>
      m.title.toLowerCase().includes(s) ||
      m.slug.toLowerCase().includes(s) ||
      (m.tags ?? []).some(t => t.toLowerCase().includes(s))
    );
  });

  constructor(private routeService: RouteService) {}

  open(slug: string) {
    this.routeService.navigateToModule(slug);

  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
