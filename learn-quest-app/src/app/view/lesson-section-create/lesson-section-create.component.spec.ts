import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LessonSectionCreateComponent} from './lesson-section-create.component';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {of} from 'rxjs';
import {LessonSectionService} from '../../services/lesson-section.service';

class LessonSectionServiceStub {
  createSection = jasmine.createSpy('createSection').and.callFake((section: any) => {
    return of({...section, id: 1});
  });
  updateSection = jasmine.createSpy('updateSection').and.callFake((section: any) => of(section));
}

describe('LessonSectionCreateComponent', () => {
  let component: LessonSectionCreateComponent;
  let fixture: ComponentFixture<LessonSectionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonSectionCreateComponent],
      providers: [
        {provide: LessonSectionService, useClass: LessonSectionServiceStub},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({lessonId: '1'})}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonSectionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
