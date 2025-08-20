import {Component, EnvironmentInjector, Injector, Input, OnChanges, ViewChild, ViewContainerRef} from '@angular/core';
import {
  CustomDashboardSectionConfig,
  SECTION_CONTEXT
} from '../../../interfaces/custom/custom-dashboard-section-config';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-custom-dashboard-section',
  imports: [
    FaIconComponent
  ],
  templateUrl: './custom-dashboard-section.component.html',
  styleUrl: './custom-dashboard-section.component.css'
})
export class CustomDashboardSectionComponent implements OnChanges {
  @Input({ required: true }) config!: CustomDashboardSectionConfig;
  @Input() editMode: boolean = false;
  @ViewChild('host', { read: ViewContainerRef, static: true })
  private host!: ViewContainerRef;

  constructor(
    private injector: Injector,
    private envInjector: EnvironmentInjector
  ) {
  }

  getIcon(): IconDefinition {
    return this.config.icon;
  }

  getTitle() {
    return this.config.title;
  }

  getDescription() {
    return this.config.description;
  }

  getType() {
    return this.config.type;
  }

  getColor() {
    return this.config.color;
  }

  getItemComponent() {
    return this.config.component;
  }

  ngOnChanges(): void {
    if (!this.config?.component) return;

    // Create a child injector so the embedded component can inject SECTION_CONTEXT
    const childInjector = Injector.create({
      providers: this.config.context !== undefined
        ? [{ provide: SECTION_CONTEXT, useValue: this.config.context }]
        : [],
      parent: this.injector
    });

    this.host.clear();
    const cmpRef = this.host.createComponent(this.config.component, {
      injector: childInjector,
      environmentInjector: this.envInjector
    });

    // Apply optional static inputs once
    for (const [k, v] of Object.entries(this.config.inputs ?? {})) {
      // setInput works with @Input aliases (Angular 14+)
      (cmpRef as any).setInput?.(k, v) ?? ((cmpRef.instance as any)[k] = v);
    }
  }
}
