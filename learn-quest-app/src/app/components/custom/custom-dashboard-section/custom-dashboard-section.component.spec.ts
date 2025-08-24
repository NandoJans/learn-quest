import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDashboardSectionComponent } from './custom-dashboard-section.component';

describe('CustomDashboardSectionComponent', () => {
  let component: CustomDashboardSectionComponent;
  let fixture: ComponentFixture<CustomDashboardSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDashboardSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDashboardSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
