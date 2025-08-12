import { Type } from '@angular/core';

export interface ModuleMeta {
  slug: string;               // route id, e.g. 'math-practice'
  title: string;              // display title
  description: string;
  icon?: string;              // optional icon class/url
  tags?: string[];
}

export interface ModuleDefinition extends ModuleMeta {
  // Lazy factory returning a Standalone Component type
  loader: () => Promise<Type<any>>;
}
