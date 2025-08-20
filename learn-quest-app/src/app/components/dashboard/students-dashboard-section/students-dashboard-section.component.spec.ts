import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsDashboardSectionComponent } from './students-dashboard-section.component';

describe('StudentsDashboardSectionComponent', () => {
  let component: StudentsDashboardSectionComponent;
  let fixture: ComponentFixture<StudentsDashboardSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsDashboardSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsDashboardSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
