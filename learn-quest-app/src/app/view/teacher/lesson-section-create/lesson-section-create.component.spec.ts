import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LessonSectionCreateComponent} from './lesson-section-create.component';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {of} from 'rxjs';
import {LessonSectionService} from '../../../services/entity/lesson-section.service';
import {LessonSection} from '../../../entities/lesson-section';
import {ModuleRegistryService} from '../../../services/module/module-registry.service';
import {ModalService} from '../../../services/modal/modal.service';

class LessonSectionServiceStub {
  private mockSections: LessonSection[] = [];

  createSection = jasmine.createSpy('createSection').and.callFake((section: any) => {
    return of({...section, id: 1});
  });
  updateSection = jasmine.createSpy('updateSection').and.callFake((section: any) => of(section));
  deleteSection = jasmine.createSpy('deleteSection').and.returnValue(of(void 0));
  
  loadSections = jasmine.createSpy('loadSections').and.callFake((params: any, callback?: (sections: LessonSection[]) => void) => {
    if (callback) {
      callback(this.mockSections);
    }
  });
  
  getSections = jasmine.createSpy('getSections').and.callFake((params: any) => {
    return this.mockSections;
  });

  // Method to set mock data for testing
  setMockSections(sections: LessonSection[]) {
    this.mockSections = sections;
  }
}

class ModuleRegistryServiceStub {
  list = jasmine.createSpy('list').and.returnValue([]);
}

class ModalServiceStub {
  open = jasmine.createSpy('open').and.returnValue(Promise.resolve(null));
}

describe('LessonSectionCreateComponent', () => {
  let component: LessonSectionCreateComponent;
  let fixture: ComponentFixture<LessonSectionCreateComponent>;
  let sectionService: LessonSectionServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonSectionCreateComponent],
      providers: [
        {provide: LessonSectionService, useClass: LessonSectionServiceStub},
        {provide: ModuleRegistryService, useClass: ModuleRegistryServiceStub},
        {provide: ModalService, useClass: ModalServiceStub},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({lessonId: '1'})}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonSectionCreateComponent);
    component = fixture.componentInstance;
    sectionService = TestBed.inject(LessonSectionService) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and populate sections from cache when data is already cached', () => {
    // Arrange
    const mockSections: LessonSection[] = [
      {
        id: 1,
        lessonId: 1,
        type: 'text',
        content: 'Test content',
        position: 0,
        moduleSlug: null,
        moduleConfig: null
      } as LessonSection,
      {
        id: 2,
        lessonId: 1,
        type: 'module',
        content: '',
        position: 1,
        moduleSlug: 'math-basic',
        moduleConfig: { operations: ['add'] }
      } as LessonSection
    ];

    sectionService.setMockSections(mockSections);

    // Act
    fixture.detectChanges(); // This triggers ngOnInit

    // Assert
    expect(sectionService.loadSections).toHaveBeenCalledWith({lesson: 1}, jasmine.any(Function));
    expect(sectionService.getSections).toHaveBeenCalledWith({lesson: 1});
    expect(component.sections.length).toBe(2);
    
    // Check that the first section was populated correctly
    const firstSection = component.sectionAt(0);
    expect(firstSection.get('id')?.value).toBe(1);
    expect(firstSection.get('type')?.value).toBe('text');
    expect(firstSection.get('content')?.value).toBe('Test content');
    
    // Check that the second section was populated correctly
    const secondSection = component.sectionAt(1);
    expect(secondSection.get('id')?.value).toBe(2);
    expect(secondSection.get('type')?.value).toBe('module');
    expect(secondSection.get('moduleSlug')?.value).toBe('math-basic');
    expect(secondSection.get('moduleConfig')?.value).toEqual({ operations: ['add'] });
  });

  it('should create empty section when no cached data exists', (done) => {
    // Arrange
    sectionService.setMockSections([]);

    // Act
    fixture.detectChanges(); // This triggers ngOnInit

    // Assert - use setTimeout to allow for the async timeout in the component
    setTimeout(() => {
      expect(component.sections.length).toBe(1);
      const section = component.sectionAt(0);
      expect(section.get('id')?.value).toBeNull();
      expect(section.get('type')?.value).toBe('text');
      done();
    }, 150);
  });

  it('should handle both callback and cached data scenarios', () => {
    // Arrange
    const mockSections: LessonSection[] = [
      {
        id: 3,
        lessonId: 1,
        type: 'question',
        content: '{"prompt": "What is 2+2?", "answers": ["3", "4"], "correctIndex": 1}',
        position: 0,
        moduleSlug: null,
        moduleConfig: null
      } as LessonSection
    ];

    sectionService.setMockSections(mockSections);

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.sections.length).toBe(1);
    const section = component.sectionAt(0);
    expect(section.get('id')?.value).toBe(3);
    expect(section.get('type')?.value).toBe('question');
    expect(section.get('questionPrompt')?.value).toBe('What is 2+2?');
    
    const answers = section.get('answers')?.value;
    expect(answers).toEqual([{text: '3'}, {text: '4'}]);
    expect(section.get('correctIndex')?.value).toBe(1);
  });
});
