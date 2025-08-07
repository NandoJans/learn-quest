import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonSectionCreateComponent } from './lesson-section-create.component';

describe('LessonSectionCreateComponent', () => {
  let component: LessonSectionCreateComponent;
  let fixture: ComponentFixture<LessonSectionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonSectionCreateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonSectionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
