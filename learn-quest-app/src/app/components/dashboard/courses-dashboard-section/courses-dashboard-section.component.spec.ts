import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesDashboardSectionComponent } from './courses-dashboard-section.component';

describe('CoursesDashboardSectionComponent', () => {
  let component: CoursesDashboardSectionComponent;
  let fixture: ComponentFixture<CoursesDashboardSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesDashboardSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesDashboardSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
