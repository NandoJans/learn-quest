import {InjectionToken, Type} from '@angular/core';
import {IconDefinition} from '@fortawesome/angular-fontawesome';

export interface CustomDashboardSectionConfig<T = unknown> {
  title: string,
  icon: IconDefinition,
  color: string,
  description: string,
  type: string,
  component: Type<any>,
  inputs?: Record<string, unknown>,
  context?: unknown;
}

export const SECTION_CONTEXT = new InjectionToken<unknown>('SECTION_CONTEXT');
