import {Component, Input, OnInit} from '@angular/core';
import {StorageService} from '../../../services/core/storage.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faPencil} from '@fortawesome/free-solid-svg-icons';
import {CustomDashboardConfig} from '../../../interfaces/custom/custom-dashboard-config';
import {CustomDashboardSectionConfig} from '../../../interfaces/custom/custom-dashboard-section-config';
import {CustomDashboardSectionComponent} from '../custom-dashboard-section/custom-dashboard-section.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-custom-dashboard',
  imports: [
    FaIconComponent,
    CustomDashboardSectionComponent,
    NgForOf
  ],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.css'
})
export class CustomDashboardComponent implements OnInit {
  @Input() config: CustomDashboardConfig = {};
  editMode: boolean = false;

  constructor(
    private storageService: StorageService
  ) {
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig() {
    Object.keys(this.config).forEach(key => {
      const item = this.storageService.get<CustomDashboardSectionConfig>(key);
      if (item) {
        this.config[key] = item;
      }
    })
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  protected readonly faPencil = faPencil;

  getDashboardSections() {
    return Object.values(this.config);
  }
}
