import { Injectable } from '@angular/core';
import {ModuleDefinition} from '../interfaces/interactive/module-meta';

@Injectable({
  providedIn: 'root'
})
export class ModuleRegistryService {
  // Register modules here. Keep imports lazy so they tree-shake nicely.
  private defs: ModuleDefinition[] = [
    {
      slug: 'math-basic',
      title: 'Math Basic',
      description: 'Basic arithmetic with configurable rules.',
      tags: ['math', 'quiz'],
      loader: () => import('../components/interactive/math-basic/math-basic.component')
        .then(m => m.MathBasicComponent)
    }
  ];

  list() { return this.defs; }

  getBySlug(slug: string) {
    return this.defs.find(d => d.slug === slug) ?? null;
  }
}
