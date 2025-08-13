import {Component, inject, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModuleRegistryService} from '../../../services/module/module-registry.service';
import {ModuleConfigService} from '../../../services/module/module-config.service';
import {NgIf} from '@angular/common';
import {RouteService} from '../../../services/core/route.service';

@Component({
  selector: 'app-interactive-widget',
  imports: [
    NgIf
  ],
  templateUrl: './interactive-widget.component.html',
  styleUrl: './interactive-widget.component.css'
})
export class InteractiveWidgetComponent {
  @ViewChild('outlet', { read: ViewContainerRef, static: true }) outlet!: ViewContainerRef;
  slug!: string;
  title = '';
  error: string | null = null;
  loading = true;

  private route = inject(ActivatedRoute);
  constructor(private registry: ModuleRegistryService,
              private configService: ModuleConfigService,
              private routeService: RouteService) {}

  async ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    const def = this.registry.getBySlug(this.slug);
    if (!def) { this.error = 'Module not found.'; this.loading = false; return; }

    this.title = def.title;

    try {
      const cmpType = await def.loader();         // lazy-load component
      const cmpRef = this.outlet.createComponent(cmpType);

      // Optional: fetch config for this module (e.g. from backend or route data)
      this.configService.getConfigForSlug(this.slug).subscribe(config => {
        if (config) {
          console.log(config)
          cmpRef.setInput('config', config); // ✅ triggers ngOnChanges
          cmpRef.setInput('mode', 'learner'); // if you also want to set mode
        }
      });

    } catch (e: any) {
      this.error = e?.message || 'Failed to load module.';
    } finally {
      this.loading = false;
    }
  }

  back() {
    this.routeService.navigateTo('modules');
  }
}
